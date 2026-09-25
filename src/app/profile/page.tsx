'use client';
/**
 * SUREFIRE PLUMBING & HEATING — Profile / Account Page
 * Flow: Register → Email Verify → Dashboard → View Bookings
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Calendar, LogOut, 
  CheckCircle2, AlertCircle, ArrowLeft
} from 'lucide-react';
import { 
  registerUser, 
  verifyEmail, 
  saveToAllUsers, 
  getCurrentUser, 
  logoutUser,
  type AuthUser
} from '@/lib/authStore';

export default function ProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState<'auth' | 'verify' | 'dashboard'>('auth');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [pendingCode, setPendingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 页面加载时检查登录状态
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setStep('dashboard');
    }
  }, []);

  // ✅ 注册提交
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const result = registerUser(email, name);
    if (result.success) {
      setPendingCode(result.code);
      setMessageType('success');
      setMessage(`演示验证码：${result.code}（实际将发送至邮箱）`);
      setStep('verify');
    } else {
      setMessageType('error');
      setMessage(result.message || '注册失败，请重试');
    }
    setIsLoading(false);
  };

  // ✅ 验证提交
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const user = verifyEmail(code);
    if (user) {
      saveToAllUsers(user);
      setMessageType('success');
      setMessage('验证成功！正在进入...');
      // 通知布局更新用户名
      window.dispatchEvent(new CustomEvent('user-updated'));
      
      setTimeout(() => {
        setStep('dashboard');
        router.refresh();
      }, 1000);
    } else {
      setMessageType('error');
      setMessage('验证码错误或已过期');
    }
    setIsLoading(false);
  };

  // ✅ 退出登录
  const handleLogout = () => {
    logoutUser();
    // 通知布局清除用户名
    window.dispatchEvent(new CustomEvent('user-updated'));
    
    setStep('auth');
    setEmail('');
    setName('');
    setCode('');
    setMessage('已退出登录');
    setMessageType('success');
  };

  const user = getCurrentUser();

  // ─── 仪表盘：已登录 ───
  if (step === 'dashboard' && user) {
    return (
      <div className="space-y-6 py-6 max-w-md mx-auto px-4">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <User size={32} className="text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-green-600 flex items-center justify-center gap-1.5">
            <CheckCircle2 size={16} />
            Verified Account
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => router.push('/profile/bookings')}
            className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
          >
            <Calendar size={20} />
            View My Bookings
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // ─── 验证邮箱 ───
  if (step === 'verify') {
    return (
      <div className="space-y-6 py-8 max-w-md mx-auto px-4">
        <button
          onClick={() => {
            setStep('auth');
            setMessage('');
            setCode('');
          }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} />
          Back to Register
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600">Enter the 6-digit code sent to<br /><strong>{email}</strong></p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm text-center ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-100' 
              : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {messageType === 'success' ? <CheckCircle2 size={16} className="inline mr-1.5" /> : <AlertCircle size={16} className="inline mr-1.5" />}
            {message}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="w-full text-center text-2xl tracking-widest py-3 border rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoComplete="one-time-code"
          />
          <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify & Create Account'}
          </button>
        </form>
      </div>
    );
  }

  // ─── 注册表单 ───
  return (
    <div className="space-y-6 py-8 max-w-md mx-auto px-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600">Register to manage your bookings</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm text-center ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-100' 
            : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {messageType === 'success' ? <CheckCircle2 size={16} className="inline mr-1.5" /> : <AlertCircle size={16} className="inline mr-1.5" />}
          {message}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <User size={14} className="inline mr-1" />
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Smith"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Mail size={14} className="inline mr-1" />
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}