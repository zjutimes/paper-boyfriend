import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST() {
  try {
    const client = getSupabaseClient();
    const { error } = await client.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: '登出失败' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { error: error.message || '登出失败' },
      { status: 500 }
    );
  }
}
