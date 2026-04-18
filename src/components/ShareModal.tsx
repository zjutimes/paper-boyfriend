'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareTitle = '我发现了一个超棒的AI虚拟恋爱产品！古风美男陪你聊天说情话～';
  const shareDesc = '选择一位古代美男作为你的虚拟男友，体验被在乎、被宠爱的感觉。';

  // 复制链接
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 分享到微信
  const handleShareWechat = () => {
    setShowQR(true);
  };

  // 分享到微博
  const handleShareWeibo = () => {
    const wbUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`;
    window.open(wbUrl, '_blank');
  };

  // 分享到QQ
  const handleShareQQ = () => {
    const qqUrl = `https://connect.qq.com/widget/shareqq/iframe_index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}&desc=${encodeURIComponent(shareDesc)}`;
    window.open(qqUrl, '_blank');
  };

  // 分享到QQ空间
  const handleShareQZone = () => {
    const qzUrl = `https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}&desc=${encodeURIComponent(shareDesc)}`;
    window.open(qzUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* 弹窗 */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <span className="text-xl">🎁</span>
              <span className="font-bold text-lg">邀请好友</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* 分享标题 */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">邀请好友一起心动</h3>
            <p className="text-gray-500 text-sm">分享给好友，双方都可获得VIP体验券</p>
          </div>

          {/* 二维码弹窗 */}
          {showQR ? (
            <div className="text-center">
              <div className="bg-gray-50 p-4 rounded-2xl inline-block mb-4">
                {/* 使用QRServer生成二维码 */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`}
                  alt="二维码"
                  className="w-48 h-48 mx-auto"
                />
              </div>
              <p className="text-gray-500 text-sm mb-4">截图保存，发给好友扫码</p>
              <button
                onClick={() => setShowQR(false)}
                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200"
              >
                返回
              </button>
            </div>
          ) : (
            <>
              {/* 分享链接 */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm text-gray-600 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-pink-500 text-white hover:bg-pink-600'
                    }`}
                  >
                    {copied ? '已复制' : '复制'}
                  </button>
                </div>
              </div>

              {/* 分享平台 */}
              <div className="mb-6">
                <p className="text-gray-500 text-sm mb-4 text-center">分享到</p>
                <div className="grid grid-cols-4 gap-4">
                  {/* 微信 */}
                  <button
                    onClick={handleShareWechat}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                      💬
                    </div>
                    <span className="text-xs text-gray-600">微信</span>
                  </button>

                  {/* 微博 */}
                  <button
                    onClick={handleShareWeibo}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                      📱
                    </div>
                    <span className="text-xs text-gray-600">微博</span>
                  </button>

                  {/* QQ */}
                  <button
                    onClick={handleShareQQ}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                      💬
                    </div>
                    <span className="text-xs text-gray-600">QQ</span>
                  </button>

                  {/* QQ空间 */}
                  <button
                    onClick={handleShareQZone}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                      📤
                    </div>
                    <span className="text-xs text-gray-600">空间</span>
                  </button>
                </div>
              </div>

              {/* 奖励说明 */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center text-2xl">
                    🎁
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">邀请奖励</p>
                    <p className="text-sm text-gray-500">每邀请1位好友，双方各得7天VIP体验</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// 分享按钮组件
export function ShareButton({ className = '' }: { className?: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-medium rounded-full hover:shadow-lg transition-all flex items-center gap-2 ${className}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        分享
      </button>
      
      <ShareModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
