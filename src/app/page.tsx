'use client';

import { ChatProvider, useChat } from '@/context/ChatContext';
import { LandingPage } from '@/components/LandingPage';
import { ChatScreen } from '@/components/ChatScreen';

function AppContent() {
  const { chatState } = useChat();

  // 如果已选择角色，显示聊天界面
  return chatState.character ? <ChatScreen /> : <LandingPage />;
}

export default function Home() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  );
}
