'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  Calculator,
  ChevronLeft,
  Image as ImageIcon,
  Trash2,
  Mail,
  Loader2,
} from 'lucide-react';
import { getBookingById, deleteBooking, type BookingRecord } from '@/lib/bookingStore';

const statusConfig = {
  pending: { label: 'Pending Confirmation', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
} as const;

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    // 1. Check local cache
    const cached = getBookingById(id);
    if (cached) setBooking(cached);

    // 2. Fetch from server API
    fetch(`/api/bookings/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.booking) {
          setBooking(data.booking);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading && !booking) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <Loader2 size={32} className="animate-spin mx-auto text-blue-600 mb-2" />
        <p className="text-gray-500">Loading booking details…</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <p className="text-gray-500 text-lg">Booking not found.</p>
        <button
          onClick={() => router.push('/bookings')}
          className="mt-6 text-blue-600 hover:underline text-sm font-medium"
        >
          &larr; Back to My Bookings
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Delete this booking? This action cannot be undone.')) {
      deleteBooking(booking.id);
      router.push('/bookings');
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  };

  const detailRows = [
    { label: 'Appointment Date', value: booking.date, icon: Calendar },
    { label: 'Time Slot', value: booking.time, icon: Clock },
    { label: 'Full Name', value: booking.name, icon: User },
    ...(booking.email ? [{ label: 'Email', value: booking.email, icon: Mail }] : []),
    { label: 'Phone', value: booking.phone, icon: Phone },
    { label: 'Address', value: booking.address, icon: MapPin },
    { label: 'Postcode', value: booking.postcode, icon: MapPin },
    { label: 'Notes', value: booking.notes || 'None provided', icon: FileText },
  ];

  return (
    <div className="space-y-6 py-4 max-w-md mx-auto">
      <button
        onClick={() => router.push('/bookings')}
        className="flex items-center text-gray-600 hover:text-blue-700 text-sm transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" /> Back to My Bookings
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 capitalize">
            {booking.service.replace(/-/g, ' ')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Reference: <span className="font-mono font-bold text-blue-800">{booking.referenceNumber || booking.id}</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Submitted: {formatDate(booking.submittedAt)}
          </p>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
            statusConfig[booking.status]?.color || 'bg-gray-100 text-gray-700'
          }`}
        >
          {statusConfig[booking.status]?.label || booking.status}
        </span>
      </div>

      {/* Price Breakdown */}
      <div className="bg-blue-50 rounded-xl p-4 space-y-2.5 border border-blue-100">
        <h3 className="font-semibold flex items-center gap-2 text-blue-900">
          <Calculator size={16} className="text-blue-700" />
          Price Breakdown
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Call-out fee (&le;10 miles)</span>
            <span>£{booking.callOutFee}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Service &amp; work base</span>
            <span>£{booking.serviceMin} – £{booking.serviceMax}</span>
          </div>
          {booking.remoteSurcharge > 0 && (
            <div className="flex justify-between text-amber-700">
              <span>Remote area surcharge</span>
              <span>+£{booking.remoteSurcharge}</span>
            </div>
          )}
          <div className="border-t border-blue-200/60 pt-2 flex justify-between font-bold text-lg text-blue-950">
            <span>Total Estimate</span>
            <span>£{booking.estMin} – £{booking.estMax}</span>
          </div>
        </div>
      </div>

      {/* Uploaded Photos Section */}
      {booking.photoUrls && booking.photoUrls.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold flex items-center gap-1.5 text-gray-700">
            <ImageIcon size={16} className="text-blue-600" />
            Uploaded Photos ({booking.photoUrls.length})
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {booking.photoUrls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity bg-gray-50"
              >
                <Image
                  src={url}
                  alt={`Booking photo ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-2xs">
        {detailRows.map((item, idx) => (
          <div
            key={item.label}
            className={`p-3.5 flex items-start gap-3 ${
              idx !== detailRows.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            <item.icon size={16} className="mt-0.5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{item.label}</p>
              <p className="text-gray-800 mt-0.5 font-medium text-sm">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="w-full flex items-center justify-center gap-2 text-red-600 border border-red-200 py-3 rounded-xl hover:bg-red-50 transition-colors text-sm font-medium"
      >
        <Trash2 size={16} />
        Cancel / Delete Booking
      </button>
    </div>
  );
}
