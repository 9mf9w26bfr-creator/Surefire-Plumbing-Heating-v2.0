'use client';

const USER_KEY = 'surefire_user';
const VERIFY_KEY = 'surefire_pending_verification';

export interface User {
  id: string;
  email: string;
  verified: boolean;
  name: string;
  createdAt: string;
}

// 注册 — 保存待验证用户，模拟发送验证码
export function registerUser(email: string, name: string): { success: boolean; code: string } {
  if (typeof window === 'undefined') return { success: false, code: '' };
  
  const code = Math.random().toString(36).slice(2, 8).toUpperCase(); // 6位验证码
  const pending = { email, name, code, expiresAt: Date.now() + 15 * 60 * 1000 }; // 15分钟有效
  localStorage.setItem(VERIFY_KEY, JSON.stringify(pending));
  
  console.log(`📧 发送验证码到 ${email}：${code}`); // 实际项目发邮件
  return { success: true, code };
}

// 验证邮箱并完成注册
export function verifyEmail(inputCode: string): User | null {
  if (typeof window === 'undefined') return null;
  
  const raw = localStorage.getItem(VERIFY_KEY);
  if (!raw) return null;
  
  const pending = JSON.parse(raw);
  if (pending.code !== inputCode.toUpperCase() || Date.now() > pending.expiresAt) {
    return null;
  }
  
  const user: User = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    email: pending.email,
    name: pending.name,
    verified: true,
    createdAt: new Date().toISOString(),
  };
  
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.removeItem(VERIFY_KEY);
  return user;
}

// 登录
export function loginUser(email: string): User | null {
  if (typeof window === 'undefined') return null;
  
  const allUsers = JSON.parse(localStorage.getItem('surefire_all_users') || '[]');
  const user = allUsers.find((u: User) => u.email === email && u.verified);
  if (!user) return null;
  
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

// 获取当前登录用户
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

// 退出登录
export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
}

// 保存到全局用户库（注册时调用）
export function saveToAllUsers(user: User): void {
  if (typeof window === 'undefined') return;
  const all = JSON.parse(localStorage.getItem('surefire_all_users') || '[]');
  all.push(user);
  localStorage.setItem('surefire_all_users', JSON.stringify(all));
}