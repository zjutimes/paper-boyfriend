'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat } from '@/context/ChatContext';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

export function ChatScreen() {
  const { chatState, sendMessage, resetChat } = useChat();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isTyping, scrollToBottom]);

  // Handle send message
  const handleSend = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    sendMessage(trimmedValue);
    setInputValue('');

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle textarea auto-resize
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Handle back to character selection
  const handleBack = () => {
    resetChat();
  };

  if (!chatState.character) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-[#EDEDED]">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
          <span className="text-lg font-serif text-gray-700">
            {chatState.character.name.charAt(0)}
          </span>
        </div>

        <div className="flex-1">
          <h1 className="font-semibold text-gray-800">{chatState.character.name}</h1>
          <p className="text-xs text-green-500">在线</p>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-xl mx-auto">
          {/* Welcome message */}
          {chatState.messages.length === 0 && !chatState.isTyping && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <span className="text-3xl font-serif text-gray-700">
                  {chatState.character.name.charAt(0)}
                </span>
              </div>
              <p className="text-gray-500 mb-2">
                你已选择 <span className="font-semibold text-gray-700">{chatState.character.name}</span>
              </p>
              <p className="text-sm text-gray-400">
                {chatState.character.tagline}
              </p>
            </div>
          )}

          {/* Messages */}
          {chatState.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              characterName={chatState.character?.name || ''}
            />
          ))}

          {/* Typing indicator */}
          {chatState.isTyping && (
            <TypingIndicator characterName={chatState.character.name} />
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-end gap-3">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder="输入消息..."
              rows={1}
              className="w-full px-4 py-3 bg-gray-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 text-gray-800 placeholder-gray-400 max-h-[120px]"
              style={{ minHeight: '48px' }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              inputValue.trim()
                ? 'bg-pink-500 text-white hover:bg-pink-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
