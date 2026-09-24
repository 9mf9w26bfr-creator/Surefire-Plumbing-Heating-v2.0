'use client';
/**
 * SUREFIRE PLUMBING & HEATING — Home Page
 * Constitution: BOOK is primary entry; local identity front-and-centre
 */
import Link from 'next/link';
import { Calendar, Wrench, Shield, Clock, MapPin, ChevronRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-8 py-6 max-w-lg mx-auto px-4">
      {/* ==============================================
          Hero Section — 黄金分割视觉比例
          标题区高度与留白接近 1:0.618
          ============================================== */}
      <section className="text-center space-y-4 py-3">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Welcome to Surefire
        </h1>
        <p className="text-lg text-gray-600 max-w-sm mx-auto">
          Reliable Plumbing & Heating across North West England
        </p>
        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
          20+ Years Local Experience • Fully Qualified
        </p>
      </section>

      {/* ==============================================
          主入口 — BOOK 按钮
          ============================================== */}
      <Link
        href="/booking"
        className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white text-center py-4 rounded-xl text-lg font-semibold shadow-lg hover:bg-blue-800 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
      >
        <Calendar size={22} />
        Book a Service
        <ChevronRight size={18} className="opacity-80" />
      </Link>

      {/* ==============================================
          服务亮点 — 四宫格
          ============================================== */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">What We Do</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              icon: Wrench,
              title: 'Plumbing',
              desc: 'Repairs & Installations',
              color: 'text-blue-600',
              bgHover: 'hover:bg-blue-50 hover:border-blue-200',
            },
            {
              icon: Shield,
              title: 'Heating',
              desc: 'Boilers & Systems',
              color: 'text-orange-600',
              bgHover: 'hover:bg-orange-50 hover:border-orange-200',
            },
            {
              icon: Clock,
              title: 'Fast Response',
              desc: 'Local Engineers',
              color: 'text-green-600',
              bgHover: 'hover:bg-green-50 hover:border-green-200',
            },
            {
              icon: Calendar,
              title: 'Flexible Slots',
              desc: 'Book Online 24/7',
              color: 'text-purple-600',
              bgHover: 'hover:bg-purple-50 hover:border-purple-200',
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`bg-gray-50 p-4 rounded-xl border border-gray-100 transition-all ${item.bgHover}`}
            >
              <item.icon size={26} className={`${item.color} mb-3`} />
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ==============================================
          服务区域
          ============================================== */}
      <section className="bg-blue-50 p-5 rounded-xl border border-blue-100">
        <h2 className="flex items-center gap-2 font-semibold text-blue-900 mb-3">
          <MapPin size={18} />
          Service Area
        </h2>
        <p className="text-sm font-medium text-blue-900 leading-relaxed">
          Liverpool • Merseyside • Cheshire • Runcorn • Widnes • Warrington • St Helens
        </p>
        <p className="text-xs text-blue-600 mt-2">
          Selected areas of Greater Manchester
        </p>
      </section>
    </div>
  );
}