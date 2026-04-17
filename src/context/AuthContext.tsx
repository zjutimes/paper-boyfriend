'use client';

import { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  email?: string;
  nickname?: string;
  selectedCharacter?: string;
  avatarKey?: string;    // 用户头像的存储key
  photos?: string[];     // 用户上传的照片key列表
}

interface PhotoUploadResult {
  key: string;
  url: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, nickname: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  uploadPhoto: (file: File) => Promise<PhotoUploadResult>;
  deletePhoto: (key: string) => Promise<boolean>;
  setAvatar: (key: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化检查
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 注册
  const signUp = async (email: string, password: string, nickname: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, nickname }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '注册失败');
    }

    if (data.user) {
      setUser(data.user);
    }
  };

  // 登录
  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '登录失败');
    }

    if (data.user) {
      setUser(data.user);
    }
  };

  // 登出
  const signOut = async () => {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('登出失败');
    }

    setUser(null);
  };

  // 更新资料
  const updateProfile = async (data: Partial<User>) => {
    const response = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || '更新失败');
    }

    if (result.user) {
      setUser(result.user);
    }
  };

  // 上传照片
  const uploadPhoto = async (file: File): Promise<PhotoUploadResult> => {
    if (!user) {
      throw new Error('请先登录');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.id);

    const response = await fetch('/api/photo/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || '上传失败');
    }

    // 更新用户的照片列表
    const newPhotos = [...(user.photos || []), result.key];
    await updateProfile({ photos: newPhotos });

    return {
      key: result.key,
      url: result.url,
    };
  };

  // 删除照片
  const deletePhoto = async (key: string): Promise<boolean> => {
    if (!user) {
      throw new Error('请先登录');
    }

    const response = await fetch(`/api/photo/delete?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      return false;
    }

    // 从用户的照片列表中移除
    const newPhotos = (user.photos || []).filter((k) => k !== key);
    await updateProfile({ photos: newPhotos });

    return true;
  };

  // 设置头像
  const setAvatar = async (key: string): Promise<void> => {
    await updateProfile({ avatarKey: key });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        uploadPhoto,
        deletePhoto,
        setAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
