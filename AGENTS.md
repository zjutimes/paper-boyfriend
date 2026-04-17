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

## 照片存储接口

使用 S3 兼容对象存储（R2）存储用户照片。

### POST /api/photo/upload
上传照片
```json
// FormData 格式
{
  "file": File,
  "userId": "用户ID"
}
```
返回：
```json
{
  "success": true,
  "key": "photos/userId/1234567890.jpg",
  "url": "签名URL",
  "fileName": "original.jpg",
  "size": 102400,
  "type": "image/jpeg"
}
```

### GET /api/photo/url
获取照片签名URL
```
GET /api/photo/url?key=photos/userId/xxx.jpg&expireTime=3600
```
返回：
```json
{
  "success": true,
  "key": "photos/userId/xxx.jpg",
  "url": "签名URL",
  "expiresIn": 3600
}
```

### DELETE /api/photo/delete
删除照片
```
DELETE /api/photo/delete?key=photos/userId/xxx.jpg
```

### GET /api/photo/list
获取用户照片列表
```
GET /api/photo/list?userId=xxx&maxKeys=50
```

## 前端组件

### PhotoUploader
照片上传组件
```tsx
import { PhotoUploader, PhotoList } from '@/components/PhotoUploader';

<PhotoUploader
  onUploadSuccess={(key, url) => console.log(key, url)}
  onUploadError={(error) => console.error(error)}
  maxSize={10}
/>

<PhotoList
  photos={['key1', 'key2']}
  onDelete={(key) => deletePhoto(key)}
  onSetAvatar={(key) => setAvatar(key)}
/>
```

### AuthContext 照片方法
```tsx
const { uploadPhoto, deletePhoto, setAvatar, user } = useAuth();

// 上传照片
const result = await uploadPhoto(file); // { key, url }

// 删除照片
await deletePhoto(key);

// 设置头像
await setAvatar(key);
```

## 角色系统

四大古风美男：
- **潘安** (pan-an): 西晋第一美男，温柔体贴
- **宋玉** (song-yu): 楚国才子，浪漫诗意
- **卫玠** (wei-jie): 魏晋名士，病弱清俊
- **兰陵王** (lan-ling): 北齐战将，高冷威武

## 客服系统

### 数据库表
- **customer_service_sessions**: 客服会话表
- **customer_service_messages**: 客服消息表
- **email_logs**: 邮件发送记录表

### API接口

#### POST /api/customer-service/sessions
创建客服会话
```json
{
  "userId": "用户ID",
  "userEmail": "用户邮箱",
  "userNickname": "用户昵称",
  "subject": "问题主题"
}
```

#### GET /api/customer-service/sessions
获取用户会话列表
```
GET /api/customer-service/sessions?userId=xxx
```

#### POST /api/customer-service/messages
发送消息
```json
{
  "sessionId": "会话ID",
  "senderType": "user|customer_service|system",
  "senderId": "发送者ID",
  "content": "消息内容",
  "messageType": "text|image|file|system"
}
```

#### GET /api/customer-service/messages
获取会话消息
```
GET /api/customer-service/messages?sessionId=xxx
```

#### PATCH /api/customer-service/close
关闭会话
```json
{
  "sessionId": "会话ID",
  "userId": "用户ID"
}
```

## 邮件发送系统

### POST /api/email/send
发送邮件
```json
{
  "toEmail": "收件人邮箱",
  "template": "customer_session_created|customer_reply|session_closed|general",
  "data": {
    "sessionId": "会话ID",
    "subject": "问题主题",
    "message": "消息内容"
  },
  "customSubject": "自定义主题",
  "customContent": "自定义内容(HTML)"
}
```

### GET /api/email/send
获取邮件发送日志
```
GET /api/email/send?toEmail=xxx&limit=20
```

### 邮件模板
- **customer_session_created**: 客服会话创建通知
- **customer_reply**: 客服回复通知
- **session_closed**: 会话关闭通知
- **general**: 通用通知

## 笑话定时功能

### 定时笑话机制
- 每个角色选择后自动启动笑话定时器
- 每隔1小时发送一个角色专属笑话
- 首次连接30秒后发送第一个笑话
- 笑话消息自动带语音

### 笑话数据结构
```typescript
interface Joke {
  text: string;      // 笑话内容
  hint?: string;    // 答案提示
}
```

### 角色笑话风格
- **潘安 (pan-an)**: 温柔体贴型
- **宋玉 (song-yu)**: 浪漫诗意型
- **卫玠 (wei-jie)**: 病弱清俊型
- **兰陵王 (lan-ling)**: 高冷威武型

### 笑话生成API
```typescript
import { getRandomJoke, getJokesByCharacterId } from '@/data/jokes';

// 获取指定角色的笑话
const jokes = getJokesByCharacterId('pan-an');

// 获取随机笑话（避免重复）
const { joke, index } = getRandomJoke('pan-an', lastIndex);
```

## 前端组件

### CustomerService / CustomerServiceButton
客服悬浮按钮组件
```tsx
import { CustomerService, CustomerServiceButton } from '@/components/CustomerService';

// 在页面中使用悬浮按钮
<CustomerServiceButton />

// 或直接使用完整客服窗口
<CustomerService onClose={() => setOpen(false)} />
```

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
