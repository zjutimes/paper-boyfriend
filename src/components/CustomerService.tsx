'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface CustomerServiceProps {
  onClose?: () => void;
}

interface Message {
  id: string;
  sender_type: string;
  content: string;
  message_type: string;
  created_at: string;
}

interface Session {
  id: string;
  subject: string;
  status: string;
  created_at: string;
}

export function CustomerService({ onClose }: CustomerServiceProps) {
  const { user } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 创建会话
  const createSession = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/customer-service/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userNickname: user.nickname,
          subject: '一般咨询',
        }),
      });
      
      const data = await response.json();
      if (data.success && data.session) {
        setSession(data.session);
        setMessages([]);
      }
    } catch (error) {
      console.error('Create session error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载会话消息
  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/customer-service/messages?sessionId=${sessionId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!inputValue.trim() || !session || isSending) return;
    
    setIsSending(true);
    try {
      const response = await fetch('/api/customer-service/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          senderType: 'user',
          senderId: user?.id,
          content: inputValue.trim(),
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setInputValue('');
        await loadMessages(session.id);
        
        // 发送邮件通知客服有新消息（可选）
        if (user?.email) {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toEmail: 'support@example.com', // 替换为实际客服邮箱
              template: 'customer_reply',
              data: {
                message: inputValue.trim(),
                sessionId: session.id,
              },
            }),
          });
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setIsSending(false);
    }
  };

  // 关闭会话
  const closeSession = async () => {
    if (!session) return;
    
    try {
      await fetch('/api/customer-service/close', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          userId: user?.id,
        }),
      });
      
      setSession(null);
      setMessages([]);
    } catch (error) {
      console.error('Close session error:', error);
    }
  };

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 定时刷新消息
  useEffect(() => {
    if (session && session.status === 'open') {
      loadMessages(session.id);
      const interval = setInterval(() => {
        loadMessages(session.id);
      }, 10000); // 每10秒刷新
      return () => clearInterval(interval);
    }
  }, [session]);

  if (!user) {
    return (
      <div className="fixed bottom-4 right-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-50">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <span className="text-xl">💬</span>
              <span className="font-bold">联系客服</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6 text-center">
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-gray-600 mb-4">请先登录后再联系客服</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">💬</span>
            <span className="font-bold">联系客服</span>
            {session && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                session.status === 'open' ? 'bg-green-400' : 'bg-gray-400'
              }`}>
                {session.status === 'open' ? '进行中' : '已关闭'}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {!session ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">👋</div>
            <h3 className="font-bold text-gray-800 mb-2">欢迎来到客服中心</h3>
            <p className="text-gray-500 text-sm mb-6">
              有什么可以帮助您的？请描述您的问题，我们会尽快回复您。
            </p>
            <button
              onClick={createSession}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? '创建中...' : '开始咨询'}
            </button>
          </div>
        ) : session.status === 'closed' ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-bold text-gray-800 mb-2">会话已关闭</h3>
            <p className="text-gray-500 text-sm mb-6">
              感谢您的咨询，如有问题欢迎随时联系。
            </p>
            <button
              onClick={createSession}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? '创建中...' : '新建会话'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 
                  msg.sender_type === 'system' ? 'justify-center' : 'justify-start'}`}
              >
                {msg.sender_type === 'system' ? (
                  <div className="px-3 py-1.5 bg-gray-200/80 text-gray-500 text-xs rounded-full">
                    {msg.content}
                  </div>
                ) : (
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                      msg.sender_type === 'user'
                        ? 'bg-pink-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.content}
                    <div className={`text-xs mt-1 ${
                      msg.sender_type === 'user' ? 'text-pink-200' : 'text-gray-400'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      {session && session.status === 'open' && (
        <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="输入您的问题..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
              disabled={isSending}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isSending}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex justify-between mt-2">
            <button
              onClick={closeSession}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              关闭会话
            </button>
            <span className="text-xs text-gray-400">
              会话ID: {session.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// 客服悬浮按钮
export function CustomerServiceButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-40 ${
          isOpen
            ? 'bg-gray-600 text-white rotate-45'
            : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-xl'
        }`}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {/* 未读消息提示 */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          1
        </span>
      </button>
      
      {isOpen && <CustomerService onClose={() => setIsOpen(false)} />}
    </>
  );
}
