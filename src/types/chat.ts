// 角色ID
export type CharacterId = 'pan-an' | 'song-yu' | 'wei-jie' | 'lan-ling';

// 角色信息
export interface Character {
  id: CharacterId;
  name: string;
  dynasty: string;
  tagline: string;
  tags: string[];
  avatar: string;
  voice: string;
  systemPrompt: string;
  appearance: string;
}

// 消息类型
export type MessageType = 'text' | 'voice' | 'image';

// 消息
export interface Message {
  id: string;
  role: 'user' | 'character';
  type: MessageType;
  content: string;
  audioUrl?: string;
  imageUrl?: string;
  imagePrompt?: string;
  timestamp: number;
}

// 聊天状态
export interface ChatState {
  character: Character | null;
  messages: Message[];
  isTyping: boolean;
  isGeneratingImage: boolean;
  isGeneratingVoice: boolean;
  userMessageCount: number;
}

// 定时任务状态
export interface ScheduledTask {
  type: 'morning' | 'night' | 'reminder';
  lastTriggered: number;
}

// API 请求/响应类型
export interface ChatRequest {
  characterId: CharacterId;
  systemPrompt: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ChatResponse {
  reply: string;
}

export interface TTSRequest {
  text: string;
  speaker: string;
  uid: string;
}

export interface TTSResponse {
  audioUrl: string;
  duration: number;
}

export interface ImageRequest {
  prompt: string;
  uid: string;
}

export interface ImageResponse {
  imageUrl: string;
}
