'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface SliderVerificationProps {
  onVerified: () => void;
  width?: number;
  height?: number;
}

export function SliderVerification({ onVerified, width = 300, height = 160 }: SliderVerificationProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [trackBg, setTrackBg] = useState('');
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  // 生成随机背景图案
  const generateBackground = useCallback(() => {
    // 生成一些随机圆形作为背景
    const circles = [];
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * (width - 40) + 20;
      const y = Math.random() * (height - 40) + 20;
      const r = Math.random() * 15 + 10;
      circles.push({ x, y, r });
    }
    
    // 生成拼图缺口位置
    const gapX = Math.random() * (width - 80) + 40;
    const gapY = Math.random() * (height - 80) + 40;
    
    setTrackBg(JSON.stringify({ circles, gapX, gapY }));
  }, [width, height]);

  useEffect(() => {
    generateBackground();
  }, [generateBackground]);

  const targetPosition = width - 50; // 滑块目标位置

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isVerified) return;
    
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || isVerified) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const trackRect = trackRef.current?.getBoundingClientRect();
    
    if (!trackRect) return;

    const newPosition = clientX - trackRect.left - 25;
    const clampedPosition = Math.max(0, Math.min(newPosition, targetPosition));
    
    setSliderPosition(clampedPosition);
  };

  const handleMouseUp = () => {
    if (!isDragging || isVerified) return;
    
    setIsDragging(false);
    
    // 检查是否滑到目标位置（允许±10px误差）
    if (sliderPosition >= targetPosition - 10) {
      setIsVerified(true);
      setTimeout(() => {
        onVerified();
      }, 300);
    } else {
      // 没滑到位，弹回
      setSliderPosition(0);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, sliderPosition, isVerified]);

  const handleRefresh = () => {
    setIsVerified(false);
    setSliderPosition(0);
    generateBackground();
  };

  return (
    <div className="space-y-3">
      <div
        ref={trackRef}
        className="relative rounded-xl overflow-hidden bg-gray-100 select-none"
        style={{ width, height }}
      >
        {/* 背景图案 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 relative">
            {/* 装饰图案 */}
            <div className="absolute inset-4 border-2 border-dashed border-gray-400/30 rounded-lg" />
            <div className="absolute top-4 left-4 w-8 h-8 bg-gray-400/20 rounded-full" />
            <div className="absolute bottom-4 right-4 w-12 h-12 bg-gray-400/20 rounded-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <svg className="w-12 h-12 text-gray-400/40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* 提示文字 */}
        {!isVerified && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="px-4 py-2 bg-white/90 rounded-full text-sm font-medium text-gray-600 shadow">
              {isDragging ? '滑动完成验证' : '按住滑块拖动到最右侧'}
            </span>
          </div>
        )}

        {/* 验证成功状态 */}
        {isVerified && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
            <div className="flex flex-col items-center">
              <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="mt-2 text-sm font-medium text-green-600">验证成功</span>
            </div>
          </div>
        )}
      </div>

      {/* 滑块 */}
      <div
        className={`relative ${isVerified ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ width }}
      >
        {/* 滑块轨道 */}
        <div className="h-12 bg-gray-200 rounded-lg relative overflow-hidden">
          {/* 进度条 */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all"
            style={{ width: `${(sliderPosition / targetPosition) * 100}%` }}
          />
          
          {/* 滑块 */}
          <div
            ref={sliderRef}
            className={`absolute top-1 left-1 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center transition-transform ${
              isDragging ? 'scale-110' : ''
            } ${isVerified ? 'translate-x-full' : ''}`}
            style={{
              transform: `translateX(${sliderPosition}px)`,
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            {isVerified ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 5H11l5 7-5 7h4.5l5-7z"/>
                <path d="M8.5 5H4l5 7-5 7h4.5l5-7z"/>
              </svg>
            )}
          </div>
        </div>

        {/* 刷新按钮 */}
        <button
          onClick={handleRefresh}
          className="absolute -right-10 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        {isVerified ? '验证成功，请继续' : '请拖动滑块完成验证'}
      </p>
    </div>
  );
}
