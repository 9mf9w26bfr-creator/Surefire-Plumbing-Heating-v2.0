import Link from 'next/link';
import { Calendar, Users, MapPin, Settings } from 'lucide-react';

export default function AdminHomePage() {
  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#0F2B4A]">Admin Dashboard</h1>
      <p className="text-gray-500">Surefire Plumbing & Heating — Management</p>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/admin/bookings"
          className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:border-[#0F2B4A]/40 hover:shadow-md transition-all"
        >
          <Calendar size={28} className="text-[#0F2B4A]" />
          <span className="font-medium">Bookings</span>
        </Link>

        <Link
          href="/admin/traders"
          className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:border-[#0F2B4A]/40 hover:shadow-md transition-all"
        >
          <Users size={28} className="text-[#0F2B4A]" />
          <span className="font-medium">Traders</span>
        </Link>

        <Link
          href="/admin/service-areas"
          className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:border-[#0F2B4A]/40 hover:shadow-md transition-all"
        >
          <MapPin size={28} className="text-[#0F2B4A]" />
          <span className="font-medium">Service Areas</span>
        </Link>

        <Link
          href="/admin/settings"
          className="flex flex-col items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl hover:border-[#0F2B4A]/40 hover:shadow-md transition-all"
        >
          <Settings size={28} className="text-[#0F2B4A]" />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </div>
  );
}