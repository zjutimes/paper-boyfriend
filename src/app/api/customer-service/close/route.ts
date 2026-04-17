import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 关闭客服会话
export async function PATCH(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    const { sessionId, userId } = body;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少会话ID' },
        { status: 400 }
      );
    }

    // 更新会话状态
    const { data: session, error } = await client
      .from('customer_service_sessions')
      .update({
        status: 'closed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      throw new Error(`关闭会话失败: ${error.message}`);
    }

    // 添加系统消息
    await client
      .from('customer_service_messages')
      .insert({
        session_id: sessionId,
        sender_type: 'system',
        content: '感谢您的咨询，如有其他问题欢迎随时联系我们。再见！',
        message_type: 'system',
      });

    return NextResponse.json({
      success: true,
      session: session,
    });

  } catch (error) {
    console.error('Close session error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '关闭会话失败' },
      { status: 500 }
    );
  }
}
