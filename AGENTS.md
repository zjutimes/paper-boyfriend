# 纸片人男友 - 开发规范

## 项目概述

AI虚拟恋爱聊天产品，用户选择一个古风美男角色，通过文字聊天互动。他会回复文字、发语音消息、主动发"自拍照片"。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI**: Tailwind CSS 4 + shadcn/ui
- **AI**: coze-coding-dev-sdk (LLM + TTS + Image)

## 目录结构

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts       # LLM对话API
│   │   ├── tts/route.ts        # TTS语音合成API
│   │   └── image/route.ts      # 图像生成API
│   ├── layout.tsx              # 全局布局
│   ├── page.tsx                # 主页面
│   └── globals.css             # 全局样式
├── components/
│   ├── CharacterSelect.tsx     # 角色选择界面
│   ├── ChatScreen.tsx          # 聊天主界面
│   ├── MessageBubble.tsx       # 消息气泡
│   ├── TypingIndicator.tsx     # 正在输入动画
│   ├── VoicePlayer.tsx         # 语音播放器
│   └── ImageViewer.tsx         # 图片查看器
├── context/
│   └── ChatContext.tsx         # 聊天状态管理
├── data/
│   └── characters.ts           # 角色数据和系统提示词
├── types/
│   └── chat.ts                 # TypeScript类型定义
├── utils/
│   ├── parseReply.ts           # 解析LLM回复
│   └── cleanText.ts            # 文本清理(TTS用)
└── hooks/
    └── useScheduledMessages.ts  # 定时消息Hook(预留)
```

## 开发命令

```bash
# 开发环境
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm ts-check

# 代码检查
pnpm lint
```

## API接口

### POST /api/chat
对话生成接口
```json
{
  "characterId": "pan-an",
  "systemPrompt": "角色系统提示词",
  "messages": [{"role": "user", "content": "消息内容"}]
}
```

### POST /api/tts
语音合成接口
```json
{
  "text": "要合成的文本",
  "speaker": "zh_male_taocheng_uranus_bigtts",
  "uid": "用户ID"
}
```

### POST /api/image
图像生成接口
```json
{
  "prompt": "图片描述",
  "uid": "用户ID"
}
```

## 角色系统

四大古风美男：
- **潘安** (pan-an): 西晋第一美男，温柔体贴
- **宋玉** (song-yu): 楚国才子，浪漫诗意
- **卫玠** (wei-jie): 魏晋名士，病弱清俊
- **兰陵王** (lan-ling): 北齐战将，高冷威武

## 关键实现

### 消息发送流程
1. 用户发送消息
2. 显示"正在输入..."动画
3. 调用 /api/chat 获取回复
4. 解析回复中的 [IMAGE: ...] 标记
5. 并行处理：文字 + 语音 + 图片

### 语音触发规则
- 关键词触发：想你、心疼、宝贝、在乎等
- 用户连续3条以上触发
- 定时消息强制带语音

### 图片生成规则
- 约每3-5轮对话发一次图
- 用户说"想见你"时必须发图
- 图片描述必须包含角色外貌特征

## 注意事项

1. coze-coding-dev-sdk 只用于后端API路由
2. 必须使用 pnpm 作为包管理器
3. 所有AI调用使用流式输出优先
4. 对话历史限制最近20条避免上下文过长
