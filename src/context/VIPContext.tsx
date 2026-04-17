'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface VIPStatus {
  isVIP: boolean;
  plan: string | null;
  expireTime: number | null;
}

interface VIPContextType {
  vipStatus: VIPStatus;
  activateVIP: (plan: string) => void;
  checkVIPStatus: () => boolean;
}

const VIPContext = createContext<VIPContextType | undefined>(undefined);

// VIP到期时间存储key
const VIP_STORAGE_KEY = 'paper_boyfriend_vip';

export function VIPProvider({ children }: { children: ReactNode }) {
  const [vipStatus, setVipStatus] = useState<VIPStatus>({
    isVIP: false,
    plan: null,
    expireTime: null,
  });

  // 检查VIP状态
  const checkVIPStatus = useCallback(() => {
    try {
      const stored = localStorage.getItem(VIP_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        // 检查是否过期
        if (data.expireTime && now < data.expireTime) {
          setVipStatus({
            isVIP: true,
            plan: data.plan,
            expireTime: data.expireTime,
          });
          return true;
        } else {
          // 已过期，清除
          localStorage.removeItem(VIP_STORAGE_KEY);
          setVipStatus({
            isVIP: false,
            plan: null,
            expireTime: null,
          });
          return false;
        }
      }
    } catch (e) {
      console.error('Check VIP error:', e);
    }
    return false;
  }, []);

  // 初始化检查VIP状态
  useEffect(() => {
    checkVIPStatus();
  }, [checkVIPStatus]);

  // 激活VIP（模拟）
  const activateVIP = useCallback((plan: string) => {
    // 根据套餐计算到期时间
    const now = Date.now();
    let days = 30; // 默认月卡30天
    
    switch (plan) {
      case 'monthly':
        days = 30;
        break;
      case 'quarterly':
        days = 90;
        break;
      case 'yearly':
        days = 365;
        break;
      default:
        days = 30;
    }

    const expireTime = now + days * 24 * 60 * 60 * 1000;

    const data = {
      plan,
      expireTime,
      activatedAt: now,
    };

    localStorage.setItem(VIP_STORAGE_KEY, JSON.stringify(data));

    setVipStatus({
      isVIP: true,
      plan,
      expireTime,
    });
  }, []);

  const value = {
    vipStatus,
    activateVIP,
    checkVIPStatus,
  };

  return (
    <VIPContext.Provider value={value}>
      {children}
    </VIPContext.Provider>
  );
}

export function useVIP() {
  const context = useContext(VIPContext);
  if (context === undefined) {
    throw new Error('useVIP must be used within a VIPProvider');
  }
  return context;
}
