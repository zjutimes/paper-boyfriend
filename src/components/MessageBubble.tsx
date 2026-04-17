'use client';

import { Message } from '@/types/chat';
import { VoicePlayer } from './VoicePlayer';
import { ImageViewer } from './ImageViewer';

interface MessageBubbleProps {
  message: Message;
  characterName: string;
  characterAvatar?: string;
}

export function MessageBubble({
  message,
  characterName,
  characterAvatar,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {/* Character Avatar (left side only) */}
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-serif text-gray-700">
            {characterName.charAt(0)}
          </span>
        </div>
      )}

      {/* Message Content */}
      <div className={`max-w-[70%] ${isUser ? 'order-1' : ''}`}>
        {/* Text or Voice or Image */}
        {message.type === 'voice' && message.audioUrl && (
          <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
            <VoicePlayer audioUrl={message.audioUrl} />
          </div>
        )}

        {message.type === 'image' && message.imageUrl && (
          <div className="bg-white rounded-2xl rounded-bl-md p-2 shadow-sm">
            <ImageViewer imageUrl={message.imageUrl} alt="角色照片" />
          </div>
        )}

        {message.type === 'text' && (
          <div
            className={`px-4 py-3 shadow-sm ${
              isUser
                ? 'bg-[#95EC69] text-gray-800 rounded-2xl rounded-br-md'
                : 'bg-white text-gray-800 rounded-2xl rounded-bl-md'
            }`}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* User Avatar (right side) */}
      {isUser && (
        <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-white">我</span>
        </div>
      )}
    </div>
  );
}
