'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (plan: string) => void;
}

// 角色头像数据
const characterAvatars = [
  'https://coze-coding-project.tos.coze.site/coze_storage_7629655528343568394/image/generate_image_2615bc43-9858-4b77-9af2-90633da989bc.jpeg', // 潘安
  'https://coze-coding-project.tos.coze.site/coze_storage_7629655528343568394/image/generate_image_0165eb93-3528-495d-99a4-0f3d9721695c.jpeg', // 宋玉
  'https://coze-coding-project.tos.coze.site/coze_storage_7629655528343568394/image/generate_image_d9783b55-25a2-48b4-b1ed-bb7e82ac2f97.jpeg', // 卫玠
  'https://coze-coding-project.tos.coze.site/coze_storage_7629655528343568394/image/generate_image_2a53fbbd-8249-49d2-b51c-bd6aee3b6157.jpeg', // 兰陵王
];

// 套餐数据
const plans = [
  {
    id: 'monthly',
    name: '月卡',
    price: 30,
    originalPrice: 58,
    period: '30天',
    avatar: characterAvatars[0],
    characterName: '潘安',
    features: [
      '无限次聊天',
      '解锁全部角色',
      '每日10次语音',
      '每日5次图片生成',
      '早安晚安推送',
    ],
    badge: '',
    popular: false,
  },
  {
    id: 'quarterly',
    name: '季卡',
    price: 80,
    originalPrice: 168,
    period: '90天',
    avatar: characterAvatars[1],
    characterName: '宋玉',
    features: [
      '无限次聊天',
      '解锁全部角色',
      '无限次语音',
      '每日10次图片生成',
      '早安晚安推送',
      '专属称呼',
    ],
    badge: '最划算',
    popular: true,
  },
  {
    id: 'yearly',
    name: '年卡',
    price: 298,
    originalPrice: 698,
    period: '365天',
    avatar: characterAvatars[3],
    characterName: '兰陵王',
    features: [
      '无限次聊天',
      '解锁全部角色',
      '无限次语音',
      '无限次图片生成',
      '早安晚安推送',
      '专属称呼',
      '专属背景图',
      '优先体验新功能',
    ],
    badge: '5折',
    popular: false,
  },
];

type PaymentMethod = 'alipay' | 'wechat';

export function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // 默认选中季卡
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('alipay');
  const [step, setStep] = useState<'select' | 'pay'>('select');
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsPaying(true);

    // 模拟支付过程
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsPaying(false);
    setPaySuccess(true);

    // 支付成功后
    setTimeout(() => {
      onSuccess(selectedPlan.id);
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    setStep('select');
    setPaySuccess(false);
    setIsPaying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-6 text-center relative">
          <h2 className="text-2xl font-bold text-white mb-1">
            {step === 'select' ? '开通会员' : '确认支付'}
          </h2>
          <p className="text-white/80 text-sm">
            {step === 'select' ? '解锁全部功能，畅享甜蜜恋爱' : `${selectedPlan.name} · ¥${selectedPlan.price}`}
          </p>

          {/* Back button */}
          {step === 'pay' && (
            <button
              onClick={() => setStep('select')}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {step === 'select' ? (
            // 套餐选择
            <div className="space-y-4">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                    selectedPlan.id === plan.id
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:border-pink-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* 角色头像 */}
                      <div className={`relative w-16 h-16 rounded-full overflow-hidden border-3 shadow-lg transition-all ${
                        selectedPlan.id === plan.id
                          ? 'border-pink-500 ring-4 ring-pink-200 scale-105'
                          : 'border-gray-200'
                      }`}>
                        <Image
                          src={plan.avatar}
                          alt={plan.characterName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        {/* 选中状态 */}
                        {selectedPlan.id === plan.id && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{plan.name}</span>
                          <span className="text-sm text-pink-500 font-medium">({plan.characterName}伴你)</span>
                          {plan.badge && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              plan.popular
                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                                : 'bg-orange-500 text-white'
                            }`}>
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{plan.period}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-pink-500">¥{plan.price}</span>
                        {plan.originalPrice > plan.price && (
                          <span className="text-sm text-gray-400 line-through">¥{plan.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedPlan.id === plan.id && (
                    <div className="mt-3 pt-3 border-t border-pink-200">
                      <div className="flex flex-wrap gap-2">
                        {plan.features.map((feature, i) => (
                          <span key={i} className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                            ✓ {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              ))}

              {/* VIP特权说明 */}
              <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-orange-100">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">👑</span>
                  VIP会员特权
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-green-500">✓</span>
                    无限次AI对话
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-green-500">✓</span>
                    无限次语音消息
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-green-500">✓</span>
                    无限次图片生成
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-green-500">✓</span>
                    专属早安晚安
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-green-500">✓</span>
                    解锁全部角色
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="text-green-500">✓</span>
                    优先体验新功能
                  </div>
                </div>
              </div>

              {/* 按钮 */}
              <button
                onClick={() => setStep('pay')}
                className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg rounded-2xl hover:shadow-lg hover:shadow-pink-200 transition-all"
              >
                立即开通 · ¥{selectedPlan.price}
              </button>

              <p className="text-center text-xs text-gray-400">
                支付即表示同意《会员服务协议》
              </p>
            </div>
          ) : (
            // 支付方式选择
            <div className="space-y-4">
              {paySuccess ? (
                // 支付成功
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">支付成功！</h3>
                  <p className="text-gray-500">正在开通会员...</p>
                </div>
              ) : (
                <>
                  {/* 订单信息 */}
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">{selectedPlan.name}</span>
                      <span className="text-xl font-bold text-pink-500">¥{selectedPlan.price}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{selectedPlan.period}</p>
                  </div>

                  {/* 支付方式 */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">选择支付方式</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setSelectedMethod('alipay')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedMethod === 'alipay'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">支</span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">支付宝</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedMethod('wechat')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedMethod === 'wechat'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-200'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">微</span>
                          </div>
                          <span className="text-sm font-medium text-gray-700">微信支付</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 支付按钮 */}
                  <button
                    onClick={handlePay}
                    disabled={isPaying}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-lg rounded-2xl hover:shadow-lg hover:shadow-pink-200 transition-all disabled:opacity-50"
                  >
                    {isPaying ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        正在唤起支付...
                      </span>
                    ) : (
                      `确认支付 ¥${selectedPlan.price}`
                    )}
                  </button>

                  {/* 提示 */}
                  <p className="text-center text-xs text-gray-400">
                    请在打开的支付页面完成付款
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
