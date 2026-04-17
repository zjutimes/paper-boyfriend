import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 发送消息
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    const { sessionId, senderType, senderId, content, messageType = 'text' } = body;
    
    if (!sessionId || !senderType || !content) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 插入消息
    const { data: message, error } = await client
      .from('customer_service_messages')
      .insert({
        session_id: sessionId,
        sender_type: senderType,
        sender_id: senderId || null,
        content: content,
        message_type: messageType,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`发送消息失败: ${error.message}`);
    }

    // 更新会话的最后消息时间和未读数
    await client
      .from('customer_service_sessions')
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    return NextResponse.json({
      success: true,
      message: message,
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '发送消息失败' },
      { status: 500 }
    );
  }
}

// 获取会话消息
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少会话ID' },
        { status: 400 }
      );
    }

    // 获取消息列表
    const { data: messages, error } = await client
      .from('customer_service_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`获取消息失败: ${error.message}`);
    }

    // 标记消息为已读
    await client
      .from('customer_service_messages')
      .update({ is_read: 1 })
      .eq('session_id', sessionId)
      .eq('is_read', 0);

    // 重置会话未读数
    await client
      .from('customer_service_sessions')
      .update({ unread_count: 0 })
      .eq('id', sessionId);

    return NextResponse.json({
      success: true,
      messages: messages || [],
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取消息失败' },
      { status: 500 }
    );
  }
}
