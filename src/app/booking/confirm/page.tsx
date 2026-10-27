'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Home, Calendar, Clock, User, Phone, MapPin, FileText, Calculator, AlertCircle, Mail, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { saveBookingAsync, type BookingRecord } from '@/lib/bookingStore';

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  const rawPhotoUrls = searchParams.get('photoUrls');
  let parsedPhotoUrls: string[] = [];
  try {
    if (rawPhotoUrls) parsedPhotoUrls = JSON.parse(rawPhotoUrls);
  } catch {}

  const bookingData = {
    service: searchParams.get('service') || '',
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '',
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    phone: searchParams.get('phone') || '',
    address: searchParams.get('address') || '',
    postcode: searchParams.get('postcode') || '',
    notes: searchParams.get('notes') || '',
    photoUrls: parsedPhotoUrls,
    imageCount: parseInt(searchParams.get('imageCount') || '0', 10),
    estMin: parseInt(searchParams.get('estMin') || '0', 10),
    estMax: parseInt(searchParams.get('estMax') || '0', 10),
    callOutFee: parseInt(searchParams.get('callOutFee') || '40', 10),
    serviceMin: parseInt(searchParams.get('serviceMin') || '0', 10),
    serviceMax: parseInt(searchParams.get('serviceMax') || '0', 10),
    remoteSurcharge: parseInt(searchParams.get('remoteSurcharge') || '0', 10),
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const saved = await saveBookingAsync(bookingData);
      setConfirmedBooking(saved);
      setSubmitted(true);
    } catch (err) {
      console.error('[Booking submission error]', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmation Success Screen
  if (submitted && confirmedBooking) {
    const reference = confirmedBooking.referenceNumber || confirmedBooking.id;
    return (
      <div className="space-y-6 py-8 text-center max-w-md mx-auto">
        <CheckCircle size={64} className="mx-auto text-green-500 animate-bounce" />
        <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
        <p className="text-gray-600">
          Thank you, <strong>{bookingData.name}</strong>. We have received your booking request.
        </p>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm">
          <p className="text-blue-600 font-medium text-xs uppercase tracking-wider">Booking Reference</p>
          <p className="font-mono font-bold text-xl text-blue-900 mt-1">{reference}</p>
        </div>

        {bookingData.email && (
          <p className="text-sm text-gray-500">
            A confirmation receipt has been sent to <strong>{bookingData.email}</strong>.
          </p>
        )}

        <p className="text-sm text-gray-500">
          Our local North West dispatch team will contact you on <strong>{bookingData.phone}</strong> within 24 hours to confirm appointment details.
        </p>

        {bookingData.estMin > 0 && bookingData.estMax > 0 && (
          <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl">
            <p className="text-xs text-gray-500">Upfront Price Estimate</p>
            <p className="text-xl font-bold text-blue-900 mt-0.5">£{bookingData.estMin} – £{bookingData.estMax}</p>
            <p className="text-xs text-gray-400 mt-1">Includes £40 call-out fee upon on-site attendance.</p>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <Link
            href={`/booking/${confirmedBooking.id}`}
            className="inline-flex items-center justify-center w-full bg-blue-700 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors shadow-sm"
          >
            View This Booking
          </Link>
          <Link
            href="/bookings"
            className="inline-flex items-center justify-center w-full border border-blue-200 text-blue-800 py-3 rounded-xl font-medium hover:bg-blue-50 transition-colors"
          >
            All My Bookings
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full border border-gray-200 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
          >
            <Home size={16} className="mr-1.5" /> Return Home
          </Link>
        </div>
      </div>
    );
  }

  const formatService = (s: string) => s.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  const hasPhotos = bookingData.imageCount > 0;
  const hasValidEstimate = bookingData.estMin > 0 && bookingData.estMax > 0;

  const reviewItems = [
    { label: 'Service', value: formatService(bookingData.service), icon: Calendar },
    { label: 'Appointment Date', value: bookingData.date, icon: Calendar },
    { label: 'Time Slot', value: bookingData.time, icon: Clock },
    { label: 'Full Name', value: bookingData.name, icon: User },
    ...(bookingData.email ? [{ label: 'Email', value: bookingData.email, icon: Mail }] : []),
    { label: 'Phone Number', value: bookingData.phone, icon: Phone },
    { label: 'Property Address', value: bookingData.address, icon: MapPin },
    { label: 'Postcode', value: bookingData.postcode, icon: MapPin },
    { label: 'Photos Uploaded', value: `${bookingData.imageCount} photo(s)`, icon: ImageIcon },
    { label: 'Additional Notes', value: bookingData.notes || 'None provided', icon: FileText },
  ];

  return (
    <div className="space-y-6 py-4 max-w-md mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review &amp; Confirm</h1>
        <p className="text-gray-600 mt-1">Step 4 — Please check all details before submitting</p>
      </div>

      {/* Price breakdown card */}
      {hasValidEstimate ? (
        <div className={`border-2 rounded-xl p-5 space-y-3 ${
          hasPhotos
            ? 'border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50'
            : 'border-amber-200 bg-amber-50/50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={20} className={hasPhotos ? 'text-blue-700' : 'text-amber-600'} />
              <h3 className="font-bold text-lg text-gray-900">
                {hasPhotos ? 'Estimated Price Range' : 'Preliminary Estimate'}
              </h3>
            </div>
            <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">
              Free Estimate
            </span>
          </div>

          <div className="bg-white/80 rounded-lg p-3 space-y-2 text-sm border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Call-out fee (&le;10 miles)</span>
              <span>£{bookingData.callOutFee}</span>
            </div>
            {bookingData.serviceMin > 0 && bookingData.serviceMax > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Service / Labour &amp; parts base</span>
                <span>£{bookingData.serviceMin} – £{bookingData.serviceMax}</span>
              </div>
            )}
            {bookingData.remoteSurcharge > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Remote area surcharge</span>
                <span>+£{bookingData.remoteSurcharge}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-lg font-bold text-blue-900">
              <span>Total Estimate</span>
              <span>£{bookingData.estMin} – £{bookingData.estMax}</span>
            </div>
          </div>

          <p className="text-xs p-2.5 rounded text-blue-800 bg-blue-50/80 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-blue-600" />
            Online quote is free upfront. Standard &pound;40 local call-out fee is included when our engineer attends on-site.
          </p>
        </div>
      ) : (
        <div className="border border-gray-100 rounded-xl p-4 text-center text-gray-400 text-sm">
          Price estimate not available — please go back and enter your postcode.
        </div>
      )}

      {/* Review Information */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        {reviewItems.map((item, index) => (
          <div
            key={item.label}
            className={`p-3.5 flex items-start gap-3 ${
              index !== reviewItems.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <item.icon size={16} className="mt-0.5 text-gray-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-gray-800 mt-0.5 break-words font-medium text-sm">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span>Submitting Booking…</span>
          </>
        ) : (
          <span>Confirm &amp; Book Service</span>
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        By submitting, you agree to be contacted regarding your booking request. Gas Safe registered engineers.
      </p>
    </div>
  );
}
