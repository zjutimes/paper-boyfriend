'use client';

import { Character } from '@/types/chat';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] text-left border border-pink-100"
    >
      {/* Avatar */}
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden">
        <span className="text-3xl font-serif text-gray-700">
          {character.name.charAt(0)}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-xl font-bold text-gray-800 text-center mb-1">
        {character.name}
      </h3>

      {/* Dynasty */}
      <p className="text-sm text-purple-600 text-center mb-2">
        {character.dynasty}
      </p>

      {/* Tagline */}
      <p className="text-sm text-gray-600 text-center mb-4">
        {character.tagline}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap justify-center gap-2">
        {character.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs bg-pink-50 text-pink-600 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-pink-300 transition-colors" />
    </button>
  );
}

export function CharacterSelect() {
  const { selectCharacter } = useChat();

  // 获取所有角色
  const { getAllCharacters } = require('@/data/characters');
  const characters = getAllCharacters();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            纸片人男友
          </h1>
          <p className="text-lg text-gray-600">
            选择一位古风美男，开启你的心动之旅
          </p>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {characters.map((character: Character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onClick={() => selectCharacter(character)}
            />
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-12">
          选择一个角色，开启你的恋爱体验
        </p>
      </div>
    </div>
  );
}
