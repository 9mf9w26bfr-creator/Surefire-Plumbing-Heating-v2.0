'use client';
/**
 * SUREFIRE PLUMBING & HEATING — Profile / Account Page
 * Flow: Sign In / Register → Email Verification Code → Dashboard → View Bookings
 */
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Calendar, LogOut, 
  CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { 
  registerOrLoginUser, 
  verifyEmailCode, 
  getCurrentUser, 
  logoutUser,
  type AuthUser
} from '@/lib/authStore';

export default function ProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState<'auth' | 'verify' | 'dashboard'>('auth');
  const [authMode, setAuthMode] = useState<'register' | 'login'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setStep('dashboard');
    }
  }, []);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setDevCodeHint(null);

    const result = await registerOrLoginUser(email, authMode === 'register' ? name : undefined);
    if (result.success) {
      setMessageType('success');
      setMessage(result.message);
      if (result.devCode) {
        setDevCodeHint(result.devCode);
      }
      setStep('verify');
    } else {
      setMessageType('error');
      setMessage(result.message || 'Failed to send verification code. Please try again.');
    }
    setIsLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    const res = await verifyEmailCode(email, code);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setMessageType('success');
      setMessage('Verified successfully! Redirecting...');
      setTimeout(() => {
        setStep('dashboard');
      }, 600);
    } else {
      setMessageType('error');
      setMessage(res.message || 'Incorrect verification code. Please try again.');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setStep('auth');
    setEmail('');
    setName('');
    setCode('');
    setMessage('You have been signed out.');
    setMessageType('success');
  };

  // ─── DASHBOARD: Logged In ───
  if (step === 'dashboard' && currentUser) {
    return (
      <div className="space-y-6 py-6 max-w-md mx-auto px-4">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <User size={32} className="text-blue-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {currentUser.name}</h1>
          <p className="text-gray-600">{currentUser.email}</p>
          <p className="text-sm text-green-600 flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 size={16} />
            Verified Customer Account
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 space-y-1">
          <p className="font-semibold flex items-center gap-1">
            <ShieldCheck size={14} className="text-blue-700" />
            North West Service Priority
          </p>
          <p className="text-blue-700">
            Your registered address is covered under our Liverpool, Merseyside &amp; Cheshire local response team.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => router.push('/bookings')}
            className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors shadow-sm"
          >
            <Calendar size={18} />
            View My Bookings
          </button>

          <button
            onClick={() => router.push('/booking')}
            className="w-full flex items-center justify-center gap-2 border border-blue-200 text-blue-800 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors"
          >
            Book Another Service
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-gray-200 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // ─── VERIFY CODE ───
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
          Back to Sign In
        </button>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Check Your Email</h1>
          <p className="text-gray-600 text-sm">
            Enter the 6-digit verification code sent to<br />
            <strong>{email}</strong>
          </p>
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

        {devCodeHint && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 text-center">
            Development Mode Code: <strong>{devCodeHint}</strong>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
            placeholder="000000"
            maxLength={6}
            className="w-full text-center text-3xl tracking-widest py-3 border border-gray-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
      </div>
    );
  }

  // ─── AUTH FORM (SIGN IN / REGISTER) ───
  return (
    <div className="space-y-6 py-8 max-w-md mx-auto px-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Customer Account</h1>
        <p className="text-gray-600 text-sm">Sign in to manage and track your plumbing appointments</p>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => { setAuthMode('login'); setMessage(''); }}
          className={`flex-1 py-2 rounded-md transition-all ${
            authMode === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setAuthMode('register'); setMessage(''); }}
          className={`flex-1 py-2 rounded-md transition-all ${
            authMode === 'register' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          New Customer
        </button>
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

      <form onSubmit={handleRequestCode} className="space-y-4">
        {authMode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <User size={14} className="inline mr-1 text-gray-500" />
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. John Smith"
              required={authMode === 'register'}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            <Mail size={14} className="inline mr-1 text-gray-500" />
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-700 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? 'Sending Code...' : authMode === 'login' ? 'Send Sign-in Code' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
