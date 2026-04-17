import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { email, password, nickname } = await request.json();

    if (!email || !password || !nickname) {
      return NextResponse.json(
        { error: '请填写所有字段' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 注册用户
    const { data: authData, error: authError } = await client.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: '注册失败，请重试' },
        { status: 400 }
      );
    }

    // 创建用户资料
    const { data: profile, error: profileError } = await client
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        nickname,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Create profile error:', profileError);
    }

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        nickname,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || '注册失败' },
      { status: 500 }
    );
  }
}
