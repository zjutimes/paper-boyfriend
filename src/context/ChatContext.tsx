'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { Character, Message, ChatState } from '@/types/chat';
import { parseReply, enhanceImagePrompt } from '@/utils/parseReply';
import { cleanTextForSpeech, isTextEmptyAfterCleaning } from '@/utils/cleanText';
import { getRandomJoke } from '@/data/jokes';

// 笑话定时器间隔（1小时 = 60 * 60 * 1000 毫秒）
const JOKE_INTERVAL = 60 * 60 * 1000;

// 初始状态
const initialState: ChatState = {
  character: null,
  messages: [],
  isTyping: false,
  isGeneratingImage: false,
  isGeneratingVoice: false,
  userMessageCount: 0,
};

// Action 类型
type Action =
  | { type: 'SELECT_CHARACTER'; payload: Character }
  | { type: 'RESET_CHAT' }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_GENERATING_IMAGE'; payload: boolean }
  | { type: 'SET_GENERATING_VOICE'; payload: boolean }
  | { type: 'INCREMENT_USER_MESSAGE_COUNT' }
  | { type: 'RESET_USER_MESSAGE_COUNT' };

// Reducer
const chatReducer = (state: ChatState, action: Action): ChatState => {
  switch (action.type) {
    case 'SELECT_CHARACTER':
      return { ...initialState, character: action.payload };
    case 'RESET_CHAT':
      return { ...state, messages: [], userMessageCount: 0 };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === action.payload.id
            ? { ...msg, ...action.payload.updates }
            : msg
        ),
      };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_GENERATING_IMAGE':
      return { ...state, isGeneratingImage: action.payload };
    case 'SET_GENERATING_VOICE':
      return { ...state, isGeneratingVoice: action.payload };
    case 'INCREMENT_USER_MESSAGE_COUNT':
      return { ...state, userMessageCount: state.userMessageCount + 1 };
    case 'RESET_USER_MESSAGE_COUNT':
      return { ...state, userMessageCount: 0 };
    default:
      return state;
  }
};

// Context 类型
interface ChatContextType {
  chatState: ChatState;
  selectCharacter: (character: Character) => void;
  resetChat: () => void;
  sendMessage: (content: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// 生成唯一 Id
const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// 判断是否应该生成语音
const shouldGenerateVoice = (
  text: string,
  userMessageCount: number,
  messageType: 'morning' | 'night' | 'normal' | 'joke' = 'normal'
): boolean => {
  // 定时消息强制带语音
  if (messageType === 'morning' || messageType === 'night' || messageType === 'joke') {
    return true;
  }

  // 关键词触发
  const keywords = ['想你', '心疼', '宝贝', '在乎', '爱你', '喜欢你', '愿不愿意', '愿闻其详', '姑娘'];
  const hasKeyword = keywords.some((k) => text.includes(k));

  // 用户连续3条以上触发
  const userTriggered = userMessageCount >= 3;

  return hasKeyword || userTriggered;
};

// 发送笑话消息（内部函数）
const sendJokeMessageInternal = async (
  character: Character,
  dispatch: React.Dispatch<Action>,
  lastJokeIndexRef: React.MutableRefObject<number>
) => {
  const { joke, index } = getRandomJoke(character.id, lastJokeIndexRef.current);
  lastJokeIndexRef.current = index;

  // 组合笑话文本（包含答案提示）
  const jokeText = joke.hint 
    ? `${joke.text}\n\n（提示：${joke.hint}）`
    : joke.text;

  // 显示"正在输入..."
  dispatch({ type: 'SET_TYPING', payload: true });

  // 模拟输入延迟
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // 添加笑话消息
  const jokeMessageId = generateId();
  const jokeMessage: Message = {
    id: jokeMessageId,
    role: 'character',
    type: 'text',
    content: jokeText,
    timestamp: Date.now(),
    isJoke: true, // 标记为笑话消息
  };
  
  dispatch({ type: 'ADD_MESSAGE', payload: jokeMessage });
  dispatch({ type: 'SET_TYPING', payload: false });

  // 为笑话生成语音（笑话消息总是带语音）
  const cleanedText = cleanTextForSpeech(jokeText);
  if (!isTextEmptyAfterCleaning(jokeText)) {
    dispatch({ type: 'SET_GENERATING_VOICE', payload: true });

    try {
      const ttsResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanedText,
          speaker: character.voice,
          uid: character.id,
        }),
      });

      if (ttsResponse.ok) {
        const ttsData = await ttsResponse.json();
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            id: jokeMessageId,
            updates: { audioUrl: ttsData.audioUrl, type: 'voice' },
          },
        });
      }
    } catch {
      // TTS 失败静默跳过
    } finally {
      dispatch({ type: 'SET_GENERATING_VOICE', payload: false });
    }
  }
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatState, dispatch] = useReducer(chatReducer, initialState);
  const isGeneratingRef = useRef(false);
  const jokeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastJokeIndexRef = useRef<number>(-1);

  // 启动笑话定时器
  const startJokeTimer = useCallback(() => {
    // 清除之前的定时器
    if (jokeTimerRef.current) {
      clearInterval(jokeTimerRef.current);
    }

    // 每小时发送一个笑话
    jokeTimerRef.current = setInterval(() => {
      if (chatState.character && !isGeneratingRef.current) {
        sendJokeMessageInternal(chatState.character, dispatch, lastJokeIndexRef);
      }
    }, JOKE_INTERVAL);
  }, [chatState.character]);

  // 停止笑话定时器
  const stopJokeTimer = useCallback(() => {
    if (jokeTimerRef.current) {
      clearInterval(jokeTimerRef.current);
      jokeTimerRef.current = null;
    }
  }, []);

  // 当选择角色时，启动定时器
  useEffect(() => {
    if (chatState.character) {
      startJokeTimer();
      
      // 30秒后发送第一个笑话（测试用），实际可改为更长间隔
      const initialJokeTimer = setTimeout(() => {
        if (chatState.character && !isGeneratingRef.current) {
          sendJokeMessageInternal(chatState.character, dispatch, lastJokeIndexRef);
        }
      }, 30000); // 30秒后发送第一个笑话
      
      return () => {
        clearTimeout(initialJokeTimer);
        stopJokeTimer();
      };
    }
  }, [chatState.character, startJokeTimer, stopJokeTimer]);

  // 选择角色
  const selectCharacter = useCallback((character: Character) => {
    dispatch({ type: 'SELECT_CHARACTER', payload: character });
  }, []);

  // 重置聊天
  const resetChat = useCallback(() => {
    dispatch({ type: 'RESET_CHAT' });
    stopJokeTimer();
  }, [stopJokeTimer]);

  // 发送消息
  const sendMessage = useCallback(
    async (content: string) => {
      if (!chatState.character || isGeneratingRef.current) return;
      if (!content.trim()) return;

      isGeneratingRef.current = true;
      dispatch({ type: 'SET_TYPING', payload: true });
      dispatch({ type: 'INCREMENT_USER_MESSAGE_COUNT' });

      // 1. 添加用户消息
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        type: 'text',
        content: content.trim(),
        timestamp: Date.now(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

      try {
        // 2. 准备对话历史（限制最近20条，排除笑话消息避免影响上下文）
        const chatHistory = chatState.messages
          .filter((msg) => !msg.isJoke) // 过滤掉笑话消息
          .slice(-20)
          .map((msg) => ({
            role: msg.role === 'character' ? 'assistant' : 'user',
            content: msg.content,
          }));
        chatHistory.push({ role: 'user', content: content.trim() });

        // 3. 调用 LLM
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            characterId: chatState.character.id,
            systemPrompt: chatState.character.systemPrompt,
            messages: chatHistory,
          }),
        });

        if (!response.ok) {
          throw new Error('Chat API failed');
        }

        const data = await response.json();
        const reply = data.reply || '网络不太好，等一下再试试～';

        // 4. 解析回复
        const { text, imagePrompt } = parseReply(reply);

        // 5. 添加角色文字消息
        const characterMessageId = generateId();
        const characterMessage: Message = {
          id: characterMessageId,
          role: 'character',
          type: 'text',
          content: text,
          timestamp: Date.now(),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: characterMessage });
        dispatch({ type: 'SET_TYPING', payload: false });

        // 6. 判断是否生成语音
        const shouldVoice = shouldGenerateVoice(
          text,
          chatState.userMessageCount
        );

        if (shouldVoice) {
          const cleanedText = cleanTextForSpeech(text);
          if (!isTextEmptyAfterCleaning(text)) {
            dispatch({ type: 'SET_GENERATING_VOICE', payload: true });

            try {
              const ttsResponse = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  text: cleanedText,
                  speaker: chatState.character.voice,
                  uid: chatState.character.id,
                }),
              });

              if (ttsResponse.ok) {
                const ttsData = await ttsResponse.json();
                dispatch({
                  type: 'UPDATE_MESSAGE',
                  payload: {
                    id: characterMessageId,
                    updates: { audioUrl: ttsData.audioUrl, type: 'voice' },
                  },
                });
              }
            } catch {
              // TTS 失败静默跳过
            } finally {
              dispatch({ type: 'SET_GENERATING_VOICE', payload: false });
            }
          }
        }

        // 7. 如果有图片标记，生成图片（每5条消息才生成一次）
        const totalMessages = chatState.messages.length;
        const shouldGenerateImage = imagePrompt && totalMessages > 0 && totalMessages % 5 === 0;
        
        if (shouldGenerateImage) {
          dispatch({ type: 'SET_GENERATING_IMAGE', payload: true });

          try {
            const enhancedPrompt = enhanceImagePrompt(
              imagePrompt,
              chatState.character.appearance
            );

            const imageResponse = await fetch('/api/image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: enhancedPrompt,
                uid: chatState.character.id,
              }),
            });

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              const imageMessage: Message = {
                id: generateId(),
                role: 'character',
                type: 'image',
                content: '[图片]',
                imageUrl: imageData.imageUrl,
                imagePrompt: enhancedPrompt,
                timestamp: Date.now(),
              };
              dispatch({ type: 'ADD_MESSAGE', payload: imageMessage });
            }
          } catch {
            // 图片生成失败静默跳过
          } finally {
            dispatch({ type: 'SET_GENERATING_IMAGE', payload: false });
          }
        }
      } catch (error) {
        console.error('Send message error:', error);
        dispatch({ type: 'SET_TYPING', payload: false });

        // 添加错误消息
        const errorMessage: Message = {
          id: generateId(),
          role: 'character',
          type: 'text',
          content: '网络不太好，等一下再试试～',
          timestamp: Date.now(),
        };
        dispatch({ type: 'ADD_MESSAGE', payload: errorMessage });
      } finally {
        isGeneratingRef.current = false;
      }
    },
    [chatState]
  );

  return (
    <ChatContext.Provider
      value={{
        chatState,
        selectCharacter,
        resetChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
