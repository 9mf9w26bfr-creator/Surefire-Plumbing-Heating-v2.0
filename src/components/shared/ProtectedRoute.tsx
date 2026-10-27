'use client';
import { useState, useEffect } from 'react';
import { ShieldAlert, KeyRound, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export default function ProtectedRoute({ children, isAdmin = false }: ProtectedRouteProps) {
  const [authorized, setAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!isAdmin) {
      const user = localStorage.getItem('surefire_user');
      setAuthorized(Boolean(user));
    } else {
      const adminAuth = sessionStorage.getItem('surefire_admin_auth');
      if (adminAuth === 'true') {
        setAuthorized(true);
      }
    }
  }, [isAdmin]);

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const validPin = process.env.NEXT_PUBLIC_ADMIN_PIN || 'surefire2026';
    if (pin.trim() === validPin) {
      sessionStorage.setItem('surefire_admin_auth', 'true');
      setAuthorized(true);
      setError('');
    } else {
      setError('Incorrect Administrator PIN.');
    }
  };

  if (!isClient) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>;
  }

  if (authorized) {
    return <>{children}</>;
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-md p-6 space-y-5 border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-800">
            <KeyRound size={24} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">Admin Security Passcode</h2>
            <p className="text-xs text-gray-500 mt-1">Enter your administrator access PIN to continue</p>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg text-center font-medium">{error}</p>
          )}

          <form onSubmit={handleAdminAuth} className="space-y-3">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN (Default: surefire2026)"
              className="w-full text-center px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono tracking-widest"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-[#0F2B4A] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Unlock Admin Panel</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <p className="text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600">
              &larr; Return to public website
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm p-6 text-center space-y-4">
        <ShieldAlert size={40} className="mx-auto text-amber-500" />
        <h2 className="text-xl font-bold text-gray-900">Sign In Required</h2>
        <p className="text-sm text-gray-500">Please sign in to your account to view this page.</p>
        <Link
          href="/profile"
          className="inline-block w-full bg-blue-700 text-white py-3 rounded-xl font-semibold hover:bg-blue-800"
        >
          Sign In / Register
        </Link>
      </div>
    </div>
  );
}
