'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Info, Users, Package, User, Clock, MapPin, LogIn } from 'lucide-react';
import './globals.css';

const COMPANY = {
  name: 'Surefire Plumbing & Heating',
  tagline: 'Professional Service Across North West England',
  logoText: 'SUREFIRE',
  logoUrl: '/logo.png',
  bannerUrl: '/service-banner.jpg',
  serviceArea: 'Liverpool • Merseyside • Cheshire • Runcorn • Widnes • Warrington • St Helens',
  experience: '20+ Years Local Professional Experience',
};

const OPENING_HOURS = [
  { day: 'Monday – Friday', hours: '8:00 – 18:00' },
  { day: 'Saturday', hours: '8:00 – 13:00' },
  { day: 'Sunday', hours: 'By Appointment Only' },
];

const navItems = [
  { label: 'BOOK', href: '/booking', icon: Calendar },
  { label: 'ABOUT US', href: '/about', icon: Info },
  { label: 'JOIN US', href: '/join', icon: Users },
  { label: 'CASES', href: '/cases', icon: Package },
  { label: 'PROFILE', href: '/profile', icon: User },
];

type UserState = { name: string; email: string } | null;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserState>(null);

  useEffect(() => {
    const checkUser = () => {
      try {
        const stored = localStorage.getItem('surefire_user');
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener('user-updated', checkUser);
    return () => window.removeEventListener('user-updated', checkUser);
  }, []);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        {/* ==============================================
            🔝 全局头部 — 自适应比例并排
            ============================================== */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <div className="max-w-2xl mx-auto px-3 py-3">
            
            {/* ✅ 并排容器：自动适配内容比例，不强制固定宽高 */}
            <div className="flex flex-row items-center gap-3 w-full">
              
              {/* 左侧 — LOGO：保持原生比例，最大高度限制不挤压横幅 */}
              <Link 
                href="/" 
                className="shrink-0 max-w-[30%]"
              >
                <div className="relative w-auto h-14 sm:h-16">
                  {COMPANY.logoUrl ? (
                    <Image
                      src={COMPANY.logoUrl}
                      alt={COMPANY.logoText}
                      width={160}
                      height={80}
                      className="w-auto h-full object-contain"
                      style={{ aspectRatio: 'auto' }}
                      priority
                      unoptimized
                    />
                  ) : (
                    <span className="text-lg font-bold text-blue-900 tracking-tight whitespace-nowrap">
                      {COMPANY.logoText}
                    </span>
                  )}
                </div>
              </Link>

              {/* 右侧 — 横幅：自适应剩余空间，保持原图比例 */}
              <div className="flex-1 min-w-0">
                <div className="relative w-full h-14 sm:h-16 rounded-xl overflow-hidden bg-gradient-to-r from-blue-800 to-blue-600">
                  {COMPANY.bannerUrl ? (
                    <Image
                      src={COMPANY.bannerUrl}
                      alt={`${COMPANY.name} — ${COMPANY.tagline}`}
                      fill
                      className="object-cover"
                      sizes="70vw"
                      style={{ aspectRatio: 'auto' }}
                      priority
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white px-2">
                      <p className="font-bold text-xs sm:text-sm">{COMPANY.name}</p>
                      <p className="text-xs opacity-80 mt-0.5 text-center line-clamp-1">
                        {COMPANY.tagline}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 第二行：经验标语 + 用户状态 */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-2 gap-2">
              <p className="text-xs text-gray-500">
                {COMPANY.experience}
              </p>
              
              <div className="flex items-center gap-2 text-sm">
                {user ? (
                  <div className="flex items-center gap-2 text-blue-700 font-medium">
                    <User size={16} />
                    <span className="truncate max-w-[120px]">{user.name}</span>
                  </div>
                ) : (
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-800 transition-colors"
                  >
                    <LogIn size={14} />
                    Register
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 主内容区 */}
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-3 py-4">
            {children}
          </div>
        </main>

        {/* 底部 */}
        <footer className="border-t border-gray-100 bg-gray-50 mt-6">
          <div className="max-w-2xl mx-auto px-3 py-4 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2 text-sm">
                <Clock size={15} className="text-blue-700" />
                Opening Hours
              </h3>
              <div className="space-y-1.5 text-sm">
                {OPENING_HOURS.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="text-gray-600">{item.day}</span>
                    <span className="font-medium text-gray-900">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2 mb-1.5 text-sm">
                <MapPin size={15} />
                Serving North West England
              </h3>
              <p className="text-xs text-blue-800 leading-relaxed mt-1">
                {COMPANY.serviceArea}
              </p>
              <p className="text-xs text-blue-600 mt-1.5">
                Selected areas of Greater Manchester
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 bg-white px-3 py-3">
            <div className="max-w-2xl mx-auto flex justify-between">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors px-2 ${
                      isActive ? 'text-blue-700' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}