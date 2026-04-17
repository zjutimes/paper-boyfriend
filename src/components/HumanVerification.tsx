'use client';

import { useState, useEffect, useCallback } from 'react';

interface HumanVerificationProps {
  onVerified: () => void;
  onSkip?: () => void;
}

export function HumanVerification({ onVerified, onSkip }: HumanVerificationProps) {
  const [countdown, setCountdown] = useState(3);
  const [isChecking, setIsChecking] = useState(true);

  // 时间验证：用户必须等待至少3秒
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsChecking(false);
    }
  }, [countdown]);

  // 行为检测：检测是否是真人在操作
  const checkHumanBehavior = useCallback(() => {
    // 检测浏览器环境
    const hasDocument = typeof document !== 'undefined';
    const hasWindow = typeof window !== 'undefined';
    const hasNavigator = typeof navigator !== 'undefined';
    
    // 检测常见自动化工具特征
    const isAutomated = 
      navigator.webdriver === true ||
      /HeadlessChrome/.test(navigator.userAgent) ||
      // @ts-ignore
      window.callPhantom !== undefined ||
      // @ts-ignore
      window._phantom !== undefined;

    return hasDocument && hasWindow && hasNavigator && !isAutomated;
  }, []);

  const handleVerify = () => {
    if (isChecking || countdown > 0) return;
    
    // 额外的行为检测
    if (checkHumanBehavior()) {
      onVerified();
    } else {
      // 如果检测到可能是机器人，再等5秒
      setCountdown(5);
      setIsChecking(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* 验证进度 */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                countdown <= i
                  ? 'bg-gray-300'
                  : countdown <= 2 && i === 2
                  ? 'bg-pink-500 animate-pulse'
                  : countdown <= 1 && i >= 1
                  ? 'bg-pink-500 animate-pulse'
                  : 'bg-pink-500'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">
          {isChecking ? (
            <span className="text-pink-500">验证中...</span>
          ) : (
            <span className="text-green-500">验证完成</span>
          )}
        </span>
      </div>

      {/* 进度条 */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000"
          style={{ width: `${((3 - countdown) / 3) * 100}%` }}
        />
      </div>

      {/* 验证状态文字 */}
      <div className="text-center">
        {isChecking ? (
          <p className="text-sm text-gray-500">
            请稍候 {countdown > 0 ? countdown : ''} 秒...
          </p>
        ) : (
          <p className="text-sm text-gray-500">
            人类验证通过！
          </p>
        )}
      </div>

      {/* 验证按钮 */}
      {!isChecking && (
        <button
          onClick={handleVerify}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          确认验证
        </button>
      )}

      {/* 跳过按钮（可选） */}
      {onSkip && !isChecking && (
        <button
          onClick={onSkip}
          className="w-full py-2 text-sm text-gray-400 hover:text-gray-600"
        >
          跳过验证
        </button>
      )}
    </div>
  );
}

// 简单的人机检测 Hook
export function useHumanDetection(minDelay: number = 3000) {
  const [isHuman, setIsHuman] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    const checkEligibility = () => {
      const now = Date.now();
      setElapsed(now - startTime);
      
      // 必须等待足够时间
      if (now - startTime >= minDelay) {
        // 检测浏览器环境
        const hasWindow = typeof window !== 'undefined';
        const hasNavigator = typeof navigator !== 'undefined';
        
        // 检测自动化工具
        const isAutomated = 
          // @ts-ignore
          navigator.webdriver === true ||
          /HeadlessChrome/.test(navigator.userAgent || '');

        setIsHuman(hasWindow && hasNavigator && !isAutomated);
      }
    };

    const interval = setInterval(checkEligibility, 100);
    
    return () => clearInterval(interval);
  }, [minDelay]);

  return { isHuman, elapsed, canSubmit: elapsed >= minDelay };
}
