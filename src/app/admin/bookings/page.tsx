'use client';
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  submittedAt: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  address: string;
  postcode: string;
  notes: string;
  status: BookingStatus;
}

const statusConfig: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500' },
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('surefire_bookings');
    if (saved) {
      setBookings(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const updateStatus = (id: string, newStatus: BookingStatus) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    setBookings(updated);
    localStorage.setItem('surefire_bookings', JSON.stringify(updated));
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-6">
      <h1 className="text-2xl font-bold text-primary">Admin — Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[b.status].color}`}>
                  {statusConfig[b.status].label}
                </span>
                <span className="text-xs text-gray-400">{b.submittedAt.slice(0, 10)}</span>
              </div>
              <h3 className="font-semibold">{b.service}</h3>
              <div className="text-sm space-y-1 text-gray-600">
                <p className="flex items-center gap-2"><Calendar size={14} /> {b.date} — {b.time}</p>
                <p className="flex items-center gap-2"><User size={14} /> {b.name}</p>
                <p className="flex items-center gap-2"><Phone size={14} /> {b.phone}</p>
                <p className="flex items-center gap-2"><MapPin size={14} className="flex-shrink-0" /> {b.address}, {b.postcode}</p>
                {b.notes && <p className="text-xs bg-gray-50 p-2 rounded mt-2">{b.notes}</p>}
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <button onClick={() => updateStatus(b.id, 'confirmed')} className="flex-1 text-xs py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                  <CheckCircle size={14} className="inline mr-1" /> Confirm
                </button>
                <button onClick={() => updateStatus(b.id, 'completed')} className="flex-1 text-xs py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                  Done
                </button>
                <button onClick={() => updateStatus(b.id, 'cancelled')} className="flex-1 text-xs py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
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