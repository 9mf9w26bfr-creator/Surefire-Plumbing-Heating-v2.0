'use client';

const STORAGE_KEYS = {
  CURRENT_USER: 'surefire_user',
  ALL_USERS: 'surefire_all_users',
  VERIFY_CODE: 'surefire_pending_code',
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  registeredAt: string;
};

type PendingCode = {
  email: string;
  name: string;
  code: string;
  expiresAt: string;
};

// ✅ 注册返回类型 — 明确包含 code
type RegisterResult =
  | { success: true; code: string; message: string }
  | { success: false; message: string };

function generateCode(): string {
  return Math.floor(Math.random() * 900000 + 100000).toString();
}

function getPendingCode(): PendingCode | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VERIFY_CODE);
    if (!raw) return null;
    const data = JSON.parse(raw) as PendingCode;
    if (new Date(data.expiresAt) < new Date()) {
      localStorage.removeItem(STORAGE_KEYS.VERIFY_CODE);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// ✅ 修复：返回类型确保有 code
export function registerUser(email: string, name: string): RegisterResult {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Cannot register on server side' };
  }

  const allUsers = getAllUsers();
  const exists = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return { success: false, message: 'This email is already registered' };
  }

  const code = generateCode();
  const pending: PendingCode = {
    email: email.toLowerCase(),
    name,
    code,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.VERIFY_CODE, JSON.stringify(pending));

  return {
    success: true,
    code, // ✅ 确保返回 code
    message: 'Verification code sent',
  };
}

export function verifyEmail(inputCode: string): AuthUser | null {
  if (typeof window === 'undefined') return null;

  const pending = getPendingCode();
  if (!pending || pending.code !== inputCode) {
    return null;
  }

  const user: AuthUser = {
    id: Date.now().toString(),
    name: pending.name,
    email: pending.email,
    verified: true,
    registeredAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  localStorage.removeItem(STORAGE_KEYS.VERIFY_CODE);
  return user;
}

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
}