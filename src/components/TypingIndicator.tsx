'use client';

export function TypingIndicator({ characterName }: { characterName: string }) {
  return (
    <div className="flex items-start gap-2 mb-4">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-serif text-gray-700">
          {characterName.charAt(0)}
        </span>
      </div>

      {/* Typing dots */}
      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Name */}
      <span className="text-xs text-gray-400 mt-1">
        {characterName}
      </span>
    </div>
  );
}
