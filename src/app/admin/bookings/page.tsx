'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Image as ImageIcon,
  Receipt,
} from 'lucide-react';
import InvoiceModal from '@/components/InvoiceModal';
import { buildDefaultInvoice, InvoiceData } from '@/utils/invoiceEngine';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  referenceNumber?: string;
  submittedAt: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  postcode: string;
  notes: string;
  photoUrls?: string[];
  priceEstLo?: number;
  priceEstHi?: number;
  status: BookingStatus;
}

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600' },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInvoice, setActiveInvoice] = useState<InvoiceData | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.bookings)) {
          setBookings(data.bookings);
          setLoading(false);
          return;
        }
      }
    } catch {}

    const saved = localStorage.getItem('surefire_bookings');
    if (saved) {
      setBookings(JSON.parse(saved));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, newStatus: BookingStatus) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {}

    const updated = bookings.map((b) =>
      b.id === id || b.referenceNumber === id ? { ...b, status: newStatus } : b
    );
    setBookings(updated);
    localStorage.setItem('surefire_bookings', JSON.stringify(updated));
  };

  const handleOpenInvoice = (b: Booking) => {
    const inv = buildDefaultInvoice({
      id: b.id,
      referenceNumber: b.referenceNumber,
      service: b.service,
      date: b.date,
      time: b.time,
      name: b.name,
      phone: b.phone,
      email: b.email,
      address: b.address,
      postcode: b.postcode,
      notes: b.notes,
      priceEstLo: b.priceEstLo,
      priceEstHi: b.priceEstHi,
    });
    setActiveInvoice(inv);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Invoice Modal Overlay */}
      {activeInvoice && (
        <InvoiceModal
          initialInvoice={activeInvoice}
          onClose={() => setActiveInvoice(null)}
        />
      )}

      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="text-gray-500 hover:text-gray-800">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0F2B4A]">
              客户预约管理 · Bookings &amp; Invoices
            </h1>
            <p className="text-xs text-gray-500">
              Liverpool &amp; North West England 预约工单与客户账单结算
            </p>
          </div>
        </div>
        <button
          onClick={fetchBookings}
          className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading bookings from server…</div>
      ) : bookings.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-500">
          <p className="font-medium">No bookings received yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Bookings submitted through the online flow will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="border border-gray-200 rounded-xl p-5 space-y-3 bg-white shadow-2xs hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      statusConfig[b.status]?.color || 'bg-gray-100'
                    }`}
                  >
                    {statusConfig[b.status]?.label || b.status}
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-800">
                    {b.referenceNumber || b.id}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {b.submittedAt?.slice(0, 10)}
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900 text-lg capitalize">
                  {b.service.replace(/-/g, ' ')}
                </h3>
                {b.priceEstLo && b.priceEstHi ? (
                  <span className="font-semibold text-blue-900 text-sm">
                    估价: £{b.priceEstLo} – £{b.priceEstHi}
                  </span>
                ) : null}
              </div>

              <div className="text-sm space-y-1.5 text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-700" /> {b.date} &bull;{' '}
                  {b.time}
                </p>
                <p className="flex items-center gap-2">
                  <User size={14} className="text-blue-700" /> {b.name}{' '}
                  {b.email ? `(${b.email})` : ''}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} className="text-blue-700" />{' '}
                  <a
                    href={`tel:${b.phone}`}
                    className="text-blue-700 hover:underline"
                  >
                    {b.phone}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-blue-700 shrink-0" />{' '}
                  {b.address}, <strong>{b.postcode}</strong>
                </p>
                {b.notes && (
                  <p className="text-xs bg-white p-2 rounded border border-gray-200 mt-2">
                    <strong>Notes:</strong> {b.notes}
                  </p>
                )}
              </div>

              {b.photoUrls && b.photoUrls.length > 0 && (
                <div className="pt-1">
                  <p className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                    <ImageIcon size={12} /> {b.photoUrls.length} Photo(s) Attached:
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {b.photoUrls.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative w-16 h-16 rounded-md overflow-hidden border shrink-0 bg-gray-50"
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status & Invoice Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => handleOpenInvoice(b)}
                  className="flex-1 min-w-[140px] text-xs py-2 bg-[#0F2B4A] text-white hover:bg-slate-900 rounded-lg font-bold shadow-xs transition flex items-center justify-center gap-1"
                >
                  <Receipt size={14} /> 一键生成账单明细
                </button>

                <button
                  onClick={() => updateStatus(b.id, 'confirmed')}
                  disabled={b.status === 'confirmed'}
                  className="text-xs px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium disabled:opacity-40"
                >
                  <CheckCircle size={14} className="inline mr-1" /> Confirm
                </button>
                <button
                  onClick={() => updateStatus(b.id, 'completed')}
                  disabled={b.status === 'completed'}
                  className="text-xs px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium disabled:opacity-40"
                >
                  Complete
                </button>
                <button
                  onClick={() => updateStatus(b.id, 'cancelled')}
                  disabled={b.status === 'cancelled'}
                  className="text-xs px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium disabled:opacity-40"
                >
                  <XCircle size={14} className="inline mr-1" /> Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
