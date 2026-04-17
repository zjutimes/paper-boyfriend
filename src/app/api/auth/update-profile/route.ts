import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { data: { session } } = await client.auth.getSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    const updateData: Record<string, string> = {};

    if (updates.nickname !== undefined) {
      updateData.nickname = updates.nickname;
    }
    if (updates.selectedCharacter !== undefined) {
      updateData.selected_character = updates.selectedCharacter;
    }
    updateData.updated_at = new Date().toISOString();

    const { data: profile, error } = await client
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '更新失败' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        ...profile,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || '更新失败' },
      { status: 500 }
    );
  }
}
