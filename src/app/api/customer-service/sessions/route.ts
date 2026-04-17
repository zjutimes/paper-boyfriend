import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 创建客服会话
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    const { userId, userEmail, userNickname, subject } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      );
    }

    // 创建新会话
    const { data: session, error } = await client
      .from('customer_service_sessions')
      .insert({
        user_id: userId,
        user_email: userEmail || null,
        user_nickname: userNickname || null,
        subject: subject || '一般咨询',
        status: 'open',
        priority: 'normal',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`创建会话失败: ${error.message}`);
    }

    // 添加欢迎消息
    await client
      .from('customer_service_messages')
      .insert({
        session_id: session.id,
        sender_type: 'system',
        content: '您好！感谢您联系我们的人工客服。请描述您的问题，我们会尽快为您解答。',
        message_type: 'system',
      });

    return NextResponse.json({
      success: true,
      session: session,
    });

  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建会话失败' },
      { status: 500 }
    );
  }
}

// 获取用户的客服会话列表
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const { data: sessions, error } = await client
      .from('customer_service_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`获取会话列表失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || [],
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取会话列表失败' },
      { status: 500 }
    );
  }
}
