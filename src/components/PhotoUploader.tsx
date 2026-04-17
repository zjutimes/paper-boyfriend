'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

interface PhotoUploaderProps {
  onUploadSuccess?: (key: string, url: string) => void;
  onUploadError?: (error: string) => void;
  maxSize?: number; // MB
  accept?: string;
}

export function PhotoUploader({
  onUploadSuccess,
  onUploadError,
  maxSize = 10,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
}: PhotoUploaderProps) {
  const { user, uploadPhoto } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // 验证文件类型
    if (!accept.includes(file.type)) {
      onUploadError?.('不支持的图片格式');
      return;
    }

    // 验证文件大小
    if (file.size > maxSize * 1024 * 1024) {
      onUploadError?.(`图片大小不能超过${maxSize}MB`);
      return;
    }

    // 生成预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // 上传文件
    setIsUploading(true);
    try {
      const result = await uploadPhoto(file);
      onUploadSuccess?.(result.key, result.url);
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : '上传失败');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  if (!user) {
    return (
      <div className="p-4 bg-gray-100 rounded-xl text-center text-gray-500">
        请先登录后上传照片
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-pink-400 bg-pink-50'
            : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50/50'
        } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        
        {preview ? (
          <div className="relative w-32 h-32 mx-auto">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📷</div>
            <div className="text-sm text-gray-600">
              <span className="text-pink-500 font-medium">点击上传</span> 或拖拽照片到这里
            </div>
            <div className="text-xs text-gray-400">
              支持 JPG、PNG、WebP 格式，最大 {maxSize}MB
            </div>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="text-center text-sm text-pink-500">
          上传中，请稍候...
        </div>
      )}
    </div>
  );
}

// 照片列表组件
interface PhotoListProps {
  photos: string[];
  onDelete?: (key: string) => void;
  onSetAvatar?: (key: string) => void;
}

export function PhotoList({ photos, onDelete, onSetAvatar }: PhotoListProps) {
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [urls, setUrls] = useState<Record<string, string>>({});

  // 加载照片URL
  const loadUrls = async () => {
    const newUrls: Record<string, string> = {};
    for (const key of photos) {
      if (!urls[key]) {
        try {
          const response = await fetch(`/api/photo/url?key=${encodeURIComponent(key)}&expireTime=3600`);
          const data = await response.json();
          if (data.url) {
            newUrls[key] = data.url;
          }
        } catch (error) {
          console.error('Failed to load photo URL:', error);
        }
      }
    }
    if (Object.keys(newUrls).length > 0) {
      setUrls((prev) => ({ ...prev, ...newUrls }));
    }
  };

  // 初始加载
  useState(() => {
    loadUrls();
  });

  const handleDelete = async (key: string) => {
    setLoadingKeys((prev) => new Set(prev).add(key));
    try {
      await onDelete?.(key);
    } finally {
      setLoadingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  if (photos.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl">
        还没有上传任何照片
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {photos.map((key) => (
        <div key={key} className="relative group">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            {urls[key] ? (
              <img
                src={urls[key]}
                alt="Photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
          
          {/* 操作按钮 */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
            {onSetAvatar && (
              <button
                onClick={() => onSetAvatar(key)}
                className="p-2 bg-white rounded-full text-pink-500 hover:bg-pink-50"
                title="设为首图"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => handleDelete(key)}
                disabled={loadingKeys.has(key)}
                className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 disabled:opacity-50"
                title="删除"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
