import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 邮件模板
interface EmailTemplate {
  subject: string;
  content: string;
}

const templates: Record<string, EmailTemplate> = {
  // 客服会话创建通知
  'customer_session_created': {
    subject: '【纸片人男友】您的客服会话已创建',
    content: `
      <h2>亲爱的用户您好！</h2>
      <p>我们已收到您的客服咨询请求，会话ID：{{sessionId}}</p>
      <p>我们的客服团队将尽快回复您，请耐心等待。</p>
      <p>您的问题：{{subject}}</p>
      <hr/>
      <p style="color:#666;font-size:12px;">如有紧急问题，请直接回复此邮件。</p>
    `,
  },
  // 客服回复通知
  'customer_reply': {
    subject: '【纸片人男友】客服有新回复',
    content: `
      <h2>亲爱的用户您好！</h2>
      <p>您的客服会话有新回复：</p>
      <blockquote style="border-left:4px solid #pink-500;padding-left:16px;margin:16px 0;">
        {{message}}
      </blockquote>
      <p><a href="{{sessionUrl}}" style="color:#pink-500;">点击查看完整对话</a></p>
      <hr/>
      <p style="color:#666;font-size:12px;">纸片人男友 - 您的专属AI恋人</p>
    `,
  },
  // 会话关闭通知
  'session_closed': {
    subject: '【纸片人男友】客服会话已关闭',
    content: `
      <h2>会话已关闭</h2>
      <p>您的客服会话已成功关闭。</p>
      <p>如有任何其他问题，欢迎随时联系我们。</p>
      <p>感谢您的使用！</p>
      <hr/>
      <p style="color:#666;font-size:12px;">纸片人男友 - 您的专属AI恋人</p>
    `,
  },
  // 通用通知
  'general': {
    subject: '【纸片人男友】{{title}}',
    content: `
      <h2>{{title}}</h2>
      <p>{{content}}</p>
      <hr/>
      <p style="color:#666;font-size:12px;">纸片人男友 - 您的专属AI恋人</p>
    `,
  },
};

// 发送邮件
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    
    const { toEmail, template: templateKey, data, customSubject, customContent } = body;
    
    if (!toEmail) {
      return NextResponse.json(
        { error: '缺少收件人邮箱' },
        { status: 400 }
      );
    }

    // 获取模板
    let emailSubject = customSubject || '';
    let emailContent = customContent || '';
    
    if (templateKey && templates[templateKey]) {
      const template = templates[templateKey];
      emailSubject = template.subject;
      emailContent = template.content;
      
      // 替换模板变量
      if (data) {
        for (const [key, value] of Object.entries(data)) {
          emailSubject = emailSubject.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
          emailContent = emailContent.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        }
      }
    }

    // 记录邮件日志
    const { data: logEntry, error: logError } = await client
      .from('email_logs')
      .insert({
        to_email: toEmail,
        subject: emailSubject,
        template: templateKey || 'custom',
        status: 'pending',
        metadata: JSON.stringify(data || {}),
      })
      .select()
      .single();

    if (logError) {
      throw new Error(`记录邮件日志失败: ${logError.message}`);
    }

    // 实际发送邮件（模拟，实际需要接入邮件服务如SendGrid/AWS SES等）
    // 这里使用coze-coding-dev-sdk中的邮件功能
    try {
      // 调用邮件发送接口
      const response = await fetch(`${process.env.COZE_BUCKET_ENDPOINT_URL || ''}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toEmail,
          subject: emailSubject,
          html: emailContent,
        }),
      });

      if (!response.ok) {
        throw new Error('邮件发送服务返回错误');
      }

      // 更新日志状态
      await client
        .from('email_logs')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', logEntry.id);

    } catch (sendError) {
      // 发送失败，更新日志
      await client
        .from('email_logs')
        .update({
          status: 'failed',
          error_message: sendError instanceof Error ? sendError.message : '发送失败',
        })
        .eq('id', logEntry.id);

      throw sendError;
    }

    return NextResponse.json({
      success: true,
      logId: logEntry.id,
      message: '邮件发送成功',
    });

  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '发送邮件失败' },
      { status: 500 }
    );
  }
}

// 获取邮件日志
export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const toEmail = searchParams.get('toEmail');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = client
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (toEmail) {
      query = query.eq('to_email', toEmail);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw new Error(`获取邮件日志失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      logs: logs || [],
    });

  } catch (error) {
    console.error('Get email logs error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取邮件日志失败' },
      { status: 500 }
    );
  }
}
