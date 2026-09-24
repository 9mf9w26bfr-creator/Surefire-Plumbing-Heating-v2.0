'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

  useEffect(() => {
    const id = params.id as string;
    setBooking(getBookingById(id));
  }, [params.id]);

  if (!booking) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <p className="text-gray-500 text-lg">Booking not found.</p>
        <button
          onClick={() => router.push('/bookings')}
          className="mt-6 text-blue-600 hover:underline text-sm"
        >
          ← Back to My Bookings
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Delete this booking? This cannot be undone.')) {
      deleteBooking(booking.id);
      router.push('/bookings');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const detailRows = [
    { label: 'Appointment Date', value: booking.date, icon: Calendar },
    { label: 'Time Slot', value: booking.time, icon: Clock },
    { label: 'Full Name', value: booking.name, icon: User },
    { label: 'Phone', value: booking.phone, icon: Phone },
    { label: 'Address', value: booking.address, icon: MapPin },
    { label: 'Postcode', value: booking.postcode, icon: MapPin },
    { label: 'Photos', value: `${booking.imageCount} photo(s) uploaded`, icon: ImageIcon },
    { label: 'Notes', value: booking.notes || 'None provided', icon: FileText },
  ] as const;

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
          <h1 className="text-2xl font-bold text-primary capitalize">
            {booking.service.replace(/-/g, ' ')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Reference: <span className="font-mono">{booking.id}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Submitted: {formatDate(booking.submittedAt)}
          </p>
        </div>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
            statusConfig[booking.status].color
          }`}
        >
          {statusConfig[booking.status].label}
        </span>
      </div>

      {/* Price Breakdown */}
      <div className="bg-blue-50 rounded-xl p-4 space-y-2.5">
        <h3 className="font-semibold flex items-center gap-2">
          <Calculator size={16} className="text-blue-700" />
          Estimated Price
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Call-out fee (≤10 miles)</span>
            <span>£{booking.callOutFee}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service / Work</span>
            <span>£{booking.serviceMin} – £{booking.serviceMax}</span>
          </div>
          {booking.remoteSurcharge > 0 && (
            <div className="flex justify-between text-amber-700">
              <span>Remote area surcharge</span>
              <span>+£{booking.remoteSurcharge}</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-bold text-lg">
            <span>Total Estimate</span>
            <span>£{booking.estMin} – £{booking.estMax}</span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        {detailRows.map((item, idx) => (
          <div
            key={item.label}
            className={`p-3.5 flex items-start gap-3 ${
              idx !== detailRows.length - 1 ? 'border-b border-gray-50' : ''
            }`}
          >
            <item.icon size={16} className="mt-0.5 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-500">{item.label}</p>
              <p className="text-gray-800 mt-0.5">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        className="w-full flex items-center justify-center gap-2 text-red-600 border border-red-100 py-2.5 rounded-lg hover:bg-red-50 transition-colors"
      >
        <Trash2 size={16} />
        Delete Booking
      </button>
    </div>
  );
}