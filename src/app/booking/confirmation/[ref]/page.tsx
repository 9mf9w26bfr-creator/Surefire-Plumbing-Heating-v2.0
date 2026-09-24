'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);

  const booking = {
    service: searchParams.get('service') || '',
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '',
    name: searchParams.get('name') || '',
    phone: searchParams.get('phone') || '',
    address: searchParams.get('address') || '',
    postcode: searchParams.get('postcode') || '',
    notes: searchParams.get('notes') || '',
  };

  const handleSubmit = () => {
    // TODO: Connect to API / send email
    console.log('Booking submitted:', booking);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-6 py-8 text-center">
        <CheckCircle size={64} className="mx-auto text-green-500" />
        <h1 className="text-2xl font-bold text-primary">Booking Confirmed!</h1>
        <p className="text-gray-600">
          Thank you, {booking.name}. We have received your request.
        </p>
        <p className="text-sm text-gray-500">
          We will contact you on {booking.phone} to confirm the appointment within 24 hours.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors mt-4"
        >
          <Home size={18} className="mr-2" /> Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <h1 className="text-2xl font-bold text-primary">Review &amp; Confirm</h1>
      <p className="text-gray-600">Step 4 — Check details before submitting</p>

      <div className="border border-gray-200 rounded-lg divide-y text-sm">
        {[
          { label: 'Service', value: booking.service.replace(/^\w/, c => c.toUpperCase()) },
          { label: 'Date', value: booking.date },
          { label: 'Time', value: booking.time },
          { label: 'Name', value: booking.name },
          { label: 'Phone', value: booking.phone },
          { label: 'Address', value: booking.address },
          { label: 'Postcode', value: booking.postcode },
          { label: 'Notes', value: booking.notes || 'None' },
        ].map(item => (
          <div key={item.label} className="p-3 flex justify-between gap-2">
            <span className="font-medium text-gray-500">{item.label}</span>
            <span className="text-right">{item.value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
      >
        Submit Booking
      </button>
    </div>
  );
}