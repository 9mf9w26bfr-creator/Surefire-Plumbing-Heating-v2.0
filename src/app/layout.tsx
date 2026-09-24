'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Calendar, Info, Users, Package, User, Clock, MapPin } from 'lucide-react';
import './globals.css';

// ==============================================
// ⚙️ 全局配置 — 上传图片到 public/ 目录即可显示
// ==============================================
const COMPANY = {
  name: 'Surefire Plumbing & Heating',
  tagline: 'Professional Service Across North West England',
  logoText: 'SUREFIRE',
  // 📌 LOGO：上传到 public/logo.png 建议 300×150px 透明背景
  logoUrl: '/logo.png',
  // 📌 横幅：上传到 public/service-banner.jpg 建议 600×150px
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-gray-900">
        {/* ==============================================
            🔝 全局固定头部 — LOGO : 横幅 = 1 : 2 并排
            ============================================== */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-3">
            {/* 容器：LOGO 占 1份，横幅占 2份 → 严格 1:2 */}
            <div className="flex flex-col md:flex-row items-center gap-3 w-full">
              
              {/* 左侧 — LOGO 区域 1/3 */}
              <Link href="/" className="w-full md:w-1/3 h-24 relative shrink-0">
                {COMPANY.logoUrl ? (
                  <Image
                    src={COMPANY.logoUrl}
                    alt={COMPANY.logoText}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 200px"
                    priority
                    unoptimized
                  />
                ) : (
                  <span className="text-2xl font-bold text-blue-900 tracking-tight flex items-center justify-center h-full">
                    {COMPANY.logoText}
                  </span>
                )}
              </Link>

              {/* 右侧 — 横幅区域 2/3 */}
              <div className="w-full md:w-2/3 h-24 rounded-xl overflow-hidden bg-gradient-to-r from-blue-800 to-blue-600 relative">
                {COMPANY.bannerUrl ? (
                  <Image
                    src={COMPANY.bannerUrl}
                    alt={`${COMPANY.name} — ${COMPANY.tagline}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, calc(200%/3)"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white px-3">
                    <p className="font-bold text-base">{COMPANY.name}</p>
                    <p className="text-sm opacity-80 mt-0.5">{COMPANY.tagline}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 底部副标题 */}
            <p className="text-xs text-gray-500 text-right mt-2">
              {COMPANY.experience}
            </p>
          </div>
        </header>

        {/* ==============================================
            📝 页面主内容
            ============================================== */}
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-4">
            {children}
          </div>
        </main>

        {/* ==============================================
            🔽 全局固定底部
            ============================================== */}
        <footer className="border-t border-gray-100 bg-gray-50 mt-6">
          <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
            {/* 营业时间 */}
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

            {/* 服务区域 */}
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

          {/* 底部导航栏 */}
          <div className="border-t border-gray-200 bg-white px-4 py-3">
            <div className="max-w-2xl mx-auto flex justify-between">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
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