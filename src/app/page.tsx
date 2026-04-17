'use client';

import { ChatProvider, useChat } from '@/context/ChatContext';
import { CharacterSelect } from '@/components/CharacterSelect';
import { ChatScreen } from '@/components/ChatScreen';

function AppContent() {
  const { chatState } = useChat();

  return chatState.character ? <ChatScreen /> : <CharacterSelect />;
}

export default function Home() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}
