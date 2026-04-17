import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '纸片人男友 | AI虚拟恋爱',
    template: '%s | 纸片人男友',
  },
  description: '选择一个古风美男，开启你的心动之旅。AI虚拟恋爱聊天产品，温柔陪伴每一天。',
  keywords: ['AI男友', '虚拟恋爱', '古风美男', '纸片人男友', '情感陪伴'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          {process.env.NODE_ENV === 'development' && <Inspector />}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
