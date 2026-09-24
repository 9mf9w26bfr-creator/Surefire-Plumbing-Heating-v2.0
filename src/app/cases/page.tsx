'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Star, MapPin, Image as ImageIcon } from 'lucide-react';

// ==============================================
// ⚙️ 配置区 — 上传图片到 public/cases/ 即可显示
// ==============================================
const CASES = [
  {
    id: 1,
    title: 'Emergency Boiler Repair — Liverpool',
    description: 'Fixed a leaking gas boiler and replaced pressure valve within 2 hours.',
    imageUrl: '/cases/case-liverpool.jpg',
    completedDate: 'Sep 2026',
  },
  {
    id: 2,
    title: 'Full Central Heating Installation — Chester',
    description: 'Installed new energy-efficient system with 8 radiators.',
    imageUrl: '/cases/case-chester.jpg',
    completedDate: 'Aug 2026',
  },
  {
    id: 3,
    title: 'Bathroom & Pipework Refit — Warrington',
    description: 'Complete pipe replacement and bathroom fixture upgrade.',
    imageUrl: '/cases/case-warrington.jpg',
    completedDate: 'Aug 2026',
  },
];

const REVIEWS = [
  {
    id: 1,
    name: 'Sarah M.',
    location: 'Liverpool',
    rating: 5,
    comment: 'Arrived on time, fixed the leak quickly, very professional. Highly recommended!',
    date: 'Sep 2026',
  },
  {
    id: 2,
    name: 'James T.',
    location: 'Chester',
    rating: 5,
    comment: 'New heating system works perfectly. Clear pricing and great workmanship.',
    date: 'Aug 2026',
  },
  {
    id: 3,
    name: 'Elena R.',
    location: 'St Helens',
    rating: 5,
    comment: 'Fixed our emergency at short notice. Very polite and tidy workers.',
    date: 'Aug 2026',
  },
];

export default function CasesReviewsPage() {
  const [activeTab, setActiveTab] = useState<'cases' | 'reviews'>('cases');

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Recent Work & Reviews</h1>
        <p className="text-gray-500 mt-1">See what we've been working on and what our customers say</p>
      </div>

      {/* 标签切换 */}
      <div className="flex mb-6 bg-gray-50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('cases')}
          className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
            activeTab === 'cases'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Completed Projects
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
            activeTab === 'reviews'
              ? 'bg-white text-blue-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Customer Reviews
        </button>
      </div>

      {/* 案例列表 */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          {CASES.map((c) => (
            <div
              key={c.id}
              className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-100 flex items-center justify-center relative">
                {c.imageUrl ? (
                  <Image
                    src={c.imageUrl}
                    alt={c.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 672px"
                  />
                ) : (
                  <ImageIcon size={40} className="text-gray-300" />
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-blue-600 font-medium">{c.completedDate}</p>
                <h3 className="font-bold text-gray-900 mt-1">{c.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 评价列表 */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {REVIEWS.map((r) => (
            <div
              key={r.id}
              className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{r.name}</h4>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} /> {r.location} • {r.date}
                  </p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">"{r.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}