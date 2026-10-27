import Link from 'next/link';
import { Calendar, Users, MapPin, Settings, Share2 } from 'lucide-react';

export default function AdminHomePage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#0F2B4A]">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Surefire Plumbing & Heating &mdash; Operations &amp; Lead Management
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/bookings"
          className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:border-[#0F2B4A]/40 hover:shadow-md transition-all text-center"
        >
          <Calendar size={28} className="text-[#0F2B4A]" />
          <div>
            <span className="font-semibold block text-sm">Bookings</span>
            <span className="text-xs text-gray-400">客户预约与账单</span>
          </div>
        </Link>

        <Link
          href="/admin/social-leads"
          className="flex flex-col items-center gap-3 p-5 bg-gradient-to-b from-blue-50/70 to-white border border-blue-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center"
        >
          <Share2 size={28} className="text-blue-700" />
          <div>
            <span className="font-semibold block text-sm text-blue-900">Social Leads</span>
            <span className="text-xs text-blue-600 font-medium">社交线索与回复</span>
          </div>
        </Link>

        <Link
          href="/admin/traders"
          className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:border-[#0F2B4A]/40 hover:shadow-md transition-all text-center"
        >
          <Users size={28} className="text-[#0F2B4A]" />
          <div>
            <span className="font-semibold block text-sm">Traders</span>
            <span className="text-xs text-gray-400">合作水暖工网络</span>
          </div>
        </Link>

        <Link
          href="/admin/service-areas"
          className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:border-[#0F2B4A]/40 hover:shadow-md transition-all text-center"
        >
          <MapPin size={28} className="text-[#0F2B4A]" />
          <div>
            <span className="font-semibold block text-sm">Service Areas</span>
            <span className="text-xs text-gray-400">区域覆盖规则</span>
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:border-[#0F2B4A]/40 hover:shadow-md transition-all text-center"
        >
          <Settings size={28} className="text-[#0F2B4A]" />
          <div>
            <span className="font-semibold block text-sm">Settings</span>
            <span className="text-xs text-gray-400">系统全局设置</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
