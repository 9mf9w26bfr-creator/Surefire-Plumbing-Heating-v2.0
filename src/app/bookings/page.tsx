'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, ChevronRight, User, Search, LogIn } from 'lucide-react';
import type { BookingRecord } from '@/lib/bookingStore';
import { getAllBookings, deleteBooking } from '@/lib/bookingStore';
import { getCurrentUser } from '@/lib/authStore';

const statusConfig = {
  pending: {
    label: 'Pending Confirmation',
    color: 'bg-yellow-100 text-yellow-700',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-green-100 text-green-700',
  },
  completed: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-700',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-500',
  },
} as const;

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const currentUser = getCurrentUser();

  // 统一刷新数据函数
  const refreshBookings = useCallback(() => {
    setBookings(getAllBookings());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  // 搜索过滤
  const filteredBookings = bookings.filter((booking) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      booking.name.toLowerCase().includes(query) ||
      booking.postcode.toLowerCase().includes(query) ||
      booking.id.toLowerCase().includes(query) ||
      booking.service.toLowerCase().includes(query)
    );
  });

  // 删除处理
  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (window.confirm('Delete this booking? This action cannot be undone.')) {
      deleteBooking(id);
      refreshBookings();
    }
  };

  // 未登录提示
  if (!currentUser) {
    return (
      <div className="space-y-6 py-16 text-center max-w-md mx-auto">
        <Calendar size={48} className="mx-auto text-gray-300" />
        <h1 className="text-2xl font-bold text-primary">My Bookings</h1>
        <p className="text-gray-500">
          Please sign in to view your booking history and manage appointments.
        </p>
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
        >
          <LogIn size={18} />
          Sign In / Register
        </Link>
      </div>
    );
  }

  // 加载状态
  if (!isLoaded) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>Loading bookings…</p>
      </div>
    );
  }

  // 暂无订单
  if (bookings.length === 0) {
    return (
      <div className="space-y-6 py-12 text-center max-w-md mx-auto">
        <Calendar size={48} className="mx-auto text-gray-300" />
        <h1 className="text-2xl font-bold text-primary">My Bookings</h1>
        <p className="text-gray-500">You haven't submitted any bookings yet.</p>
        <Link
          href="/booking"
          className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
        >
          <Calendar size={18} />
          Book a Service
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 max-w-md mx-auto">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">My Bookings</h1>
          <p className="text-gray-600 mt-1">
            Hello, <strong>{currentUser.name}</strong> —{' '}
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/booking"
          className="inline-flex items-center gap-1.5 bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors whitespace-nowrap"
        >
          <Calendar size={16} />
          New
        </Link>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by name, postcode, reference or service…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
        />
      </div>

      {/* 订单列表 */}
      <div className="space-y-3">
        {filteredBookings.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No bookings match your search.
          </p>
        ) : (
          filteredBookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="block border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all group bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    statusConfig[booking.status].color
                  }`}
                >
                  {statusConfig[booking.status].label}
                </span>
                <span className="text-xs font-mono text-gray-400">
                  {booking.id.slice(0, 8)}…
                </span>
              </div>

              <h3 className="font-semibold capitalize mb-2 group-hover:text-blue-700 transition-colors">
                {booking.service.replace(/-/g, ' ')}
              </h3>

              <div className="space-y-1.5 text-sm text-gray-500">
                <p className="flex items-center gap-2">
                  <Calendar size={14} className="flex-shrink-0" />
                  {booking.date}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={14} className="flex-shrink-0" />
                  {booking.time}
                </p>
                <p className="flex items-center gap-2">
                  <User size={14} className="flex-shrink-0" />
                  {booking.name}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="flex-shrink-0" />
                  {booking.postcode}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="font-bold text-blue-900">
                  £{booking.estMin} – £{booking.estMax}
                </span>
                <span className="flex items-center text-gray-400 text-sm group-hover:text-blue-600 transition-colors">
                  View <ChevronRight size={14} className="ml-1" />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}