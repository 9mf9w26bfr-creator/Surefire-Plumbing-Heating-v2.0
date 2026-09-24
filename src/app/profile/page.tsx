'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, verifyEmail, saveToAllUsers, getCurrentUser, logoutUser } from '@/lib/authStore';

export default function ProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState<'auth' | 'verify' | 'dashboard'>('auth');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [pendingCode, setPendingCode] = useState('');

  // 已登录直接进面板
  useState(() => {
    const user = getCurrentUser();
    if (user) setStep('dashboard');
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const result = registerUser(email, name);
    if (result.success) {
      setPendingCode(result.code);
      setMessage(`验证码已生成（演示用）：${result.code}`);
      setStep('verify');
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const user = verifyEmail(code);
    if (user) {
      saveToAllUsers(user);
      setMessage('验证成功！');
      setTimeout(() => {
        setStep('dashboard');
        router.refresh();
      }, 800);
    } else {
      setMessage('验证码错误或已过期');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setStep('auth');
    setEmail('');
    setName('');
    setCode('');
    setMessage('已退出登录');
  };

  const user = getCurrentUser();

  if (step === 'dashboard' && user) {
    return (
      <div className="space-y-6 py-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
        <p className="text-gray-600">{user.email}</p>
        <p className="text-sm text-green-600">✓ Verified Account</p>
        
        <button
          onClick={() => router.push('/bookings')}
          className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold"
        >
          View My Bookings
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full border border-gray-200 py-3 rounded-xl text-gray-600"
        >
          Log Out
        </button>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="space-y-6 py-8 max-w-md mx-auto">
        <h1 className="text-2xl font-bold">Verify Your Email</h1>
        <p className="text-gray-600">Enter the 6-digit code sent to {email}</p>
        <div className="bg-blue-50 p-3 rounded-lg text-sm font-mono text-center">
          {message}
        </div>
        
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter code"
            maxLength={6}
            className="w-full text-center text-2xl tracking-widest py-3 border rounded-lg"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
          >
            Verify & Create Account
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Create Account</h1>
      <p className="text-gray-600">Register to manage your bookings</p>
      
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-3 rounded-xl font-semibold"
        >
          Continue
        </button>
      </form>
      
      {message && <p className="text-center text-sm text-green-600">{message}</p>}
    </div>
  );
}