import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { data: { session } } = await client.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ user: null });
    }

    // 获取用户资料
    const { data: profile, error } = await client
      .from('user_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('Get profile error:', error);
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        ...profile,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}
