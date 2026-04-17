import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: '请填写邮箱和密码' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 登录
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: '登录失败，请重试' },
        { status: 400 }
      );
    }

    // 获取用户资料
    const { data: profile } = await client
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        ...profile,
      },
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: error.message || '登录失败' },
      { status: 500 }
    );
  }
}
