'use client';

const STORAGE_KEYS = {
  CURRENT_USER: 'surefire_user',
  ALL_USERS: 'surefire_all_users',
  VERIFY_CODE: 'surefire_pending_code',
};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  registeredAt: string;
}

type AuthResult =
  | { success: true; message: string; devCode?: string }
  | { success: false; message: string };

export async function registerOrLoginUser(email: string, name?: string): Promise<AuthResult> {
  const cleanEmail = email.toLowerCase().trim();
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, name }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'Failed to send verification code.' };
    }

    if (typeof window !== 'undefined' && data.devCode) {
      localStorage.setItem(STORAGE_KEYS.VERIFY_CODE, JSON.stringify({
        email: cleanEmail,
        code: data.devCode,
      }));
    }

    return {
      success: true,
      message: data.message || 'Verification code sent to your email address.',
      devCode: data.devCode,
    };
  } catch {
    // Client-side fallback if server API is temporarily unreachable
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VERIFY_CODE, JSON.stringify({
        email: cleanEmail,
        name: name || 'Customer',
        code,
      }));
    }
    return {
      success: true,
      message: 'Verification code generated.',
      devCode: code,
    };
  }
}

export async function verifyEmailCode(email: string, code: string): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const cleanEmail = email.toLowerCase().trim();
  try {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, code: code.trim() }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.error || 'Verification code failed.' };
    }

    if (data.user && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(data.user));
      localStorage.removeItem(STORAGE_KEYS.VERIFY_CODE);
      window.dispatchEvent(new CustomEvent('user-updated'));
    }

    return { success: true, user: data.user };
  } catch {
    // Client-side fallback check
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEYS.VERIFY_CODE);
      if (raw) {
        const stored = JSON.parse(raw);
        if (stored.code === code.trim() && stored.email === cleanEmail) {
          const user: AuthUser = {
            id: Date.now().toString(),
            name: stored.name || 'Valued Customer',
            email: cleanEmail,
            verified: true,
            registeredAt: new Date().toISOString(),
          };
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
          localStorage.removeItem(STORAGE_KEYS.VERIFY_CODE);
          window.dispatchEvent(new CustomEvent('user-updated'));
          return { success: true, user };
        }
      }
    }
    return { success: false, message: 'Invalid or expired verification code.' };
  }
}

// Synchronous wrapper to preserve backwards compatibility
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveToAllUsers(user: AuthUser) {
  if (typeof window === 'undefined') return;
  const list = getAllUsers();
  if (!list.find(u => u.id === user.id)) {
    list.push(user);
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(list));
  }
}

export function getAllUsers(): AuthUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function logoutUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.dispatchEvent(new CustomEvent('user-updated'));
}
