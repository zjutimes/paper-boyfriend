'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        if (!nickname.trim()) {
          setError('请输入昵称');
          setLoading(false);
          return;
        }
        await signUp(email, password, nickname);
      }
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setNickname('');
    setError('');
    setMode('login');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'login' ? '欢迎回来' : '开始心动'}
          </h2>
          <p className="text-white/80 text-sm">
            {mode === 'login' ? '登录后继续你的恋爱之旅' : '创建账户，开启专属心动'}
          </p>

          {/* Tab Switcher */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setMode('login')}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-pink-600'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              登录
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white text-pink-600'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              注册
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                昵称
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="给自己取个心动昵称"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </button>

          <p className="text-center text-sm text-gray-500">
            {mode === 'login' ? '还没有账户？' : '已有账户？'}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-pink-500 font-medium hover:underline ml-1"
            >
              {mode === 'login' ? '立即注册' : '去登录'}
            </button>
          </p>
        </form>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
