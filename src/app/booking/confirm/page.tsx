'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Home, Calendar, Clock, User, Phone, MapPin, FileText, Calculator, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { saveBooking } from '@/lib/bookingStore'; // ✅ 必须导入

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [savedBookingId, setSavedBookingId] = useState<string>('');

  // ✅ 正确定义变量：bookingData
  const bookingData = {
    service: searchParams.get('service') || '',
    date: searchParams.get('date') || '',
    time: searchParams.get('time') || '',
    name: searchParams.get('name') || '',
    phone: searchParams.get('phone') || '',
    address: searchParams.get('address') || '',
    postcode: searchParams.get('postcode') || '',
    notes: searchParams.get('notes') || '',
    imageCount: parseInt(searchParams.get('imageCount') || '0', 10),
    estMin: parseInt(searchParams.get('estMin') || '0', 10),
    estMax: parseInt(searchParams.get('estMax') || '0', 10),
    callOutFee: parseInt(searchParams.get('callOutFee') || '35', 10),
    serviceMin: parseInt(searchParams.get('serviceMin') || '0', 10),
    serviceMax: parseInt(searchParams.get('serviceMax') || '0', 10),
    remoteSurcharge: parseInt(searchParams.get('remoteSurcharge') || '0', 10),
  };

  const handleSubmit = () => {
    // ✅ 现在 bookingData 已定义，可以正常使用
    const saved = saveBooking(bookingData);
    setSavedBookingId(saved.id);
    console.log('✅ Booking saved:', saved);
    setSubmitted(true);
  };

  // 提交成功页面
  if (submitted) {
    return (
      <div className="space-y-6 py-8 text-center max-w-md mx-auto">
        <CheckCircle size={64} className="mx-auto text-green-500" />
        <h1 className="text-2xl font-bold text-primary">Booking Confirmed!</h1>
        <p className="text-gray-600">
          Thank you, <strong>{bookingData.name}</strong>. We have received your request.
        </p>
        <div className="bg-gray-50 p-3 rounded-lg text-sm">
          <p className="text-gray-500">Booking Reference</p>
          <p className="font-mono font-bold text-lg text-blue-700">{savedBookingId}</p>
        </div>
        <p className="text-sm text-gray-500">
          We will contact you on <strong>{bookingData.phone}</strong> within 24 hours.
        </p>
        {bookingData.estMin > 0 && bookingData.estMax > 0 && (
          <div className="bg-blue-50 p-3 rounded-lg mt-2">
            <p className="text-sm text-gray-500">Estimated Price</p>
            <p className="text-xl font-bold text-blue-900">£{bookingData.estMin} – £{bookingData.estMax}</p>
          </div>
        )}
        <div className="flex flex-col gap-3 mt-4">
          <Link
            href="/bookings"
            className="inline-flex items-center justify-center w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
          >
            View My Bookings
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full border border-gray-200 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <Home size={18} className="mr-2" /> Return Home
          </Link>
        </div>
      </div>
    );
  }

  // 格式化服务名称
  const formatService = (s: string) => s.replace(/^\w/, (c) => c.toUpperCase());
  const hasPhotos = bookingData.imageCount > 0;
  const hasValidEstimate = bookingData.estMin > 0 && bookingData.estMax > 0;

  // 预约信息项
  const reviewItems = [
    { label: 'Service', value: formatService(bookingData.service), icon: Calendar },
    { label: 'Date', value: bookingData.date, icon: Calendar },
    { label: 'Time', value: bookingData.time, icon: Clock },
    { label: 'Full Name', value: bookingData.name, icon: User },
    { label: 'Phone Number', value: bookingData.phone, icon: Phone },
    { label: 'Address', value: bookingData.address, icon: MapPin },
    { label: 'Postcode', value: bookingData.postcode, icon: MapPin },
    { label: 'Additional Notes', value: bookingData.notes || 'None provided', icon: FileText },
    { label: 'Photos Uploaded', value: `${bookingData.imageCount} photo(s)`, icon: Calculator },
  ];

  return (
    <div className="space-y-6 py-4 max-w-md mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-primary">Review & Confirm</h1>
        <p className="text-gray-600 mt-1">Step 4 — Please check all details before submitting</p>
      </div>

      {/* 💰 价格明细卡片 */}
      {hasValidEstimate ? (
        <div className={`border-2 rounded-xl p-5 space-y-3 ${
          hasPhotos
            ? 'border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50'
            : 'border-amber-200 bg-amber-50/50'
        }`}>
          <div className="flex items-center gap-2">
            <Calculator size={20} className={hasPhotos ? 'text-blue-700' : 'text-amber-600'} />
            <h3 className="font-bold text-lg">
              {hasPhotos ? 'Estimated Price Range' : 'Preliminary Estimate'}
            </h3>
          </div>

          {/* 分项明细 */}
          <div className="bg-white/70 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Call-out fee (≤10 miles)</span>
              <span>£{bookingData.callOutFee}</span>
            </div>
            {bookingData.serviceMin > 0 && bookingData.serviceMax > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Service / Work</span>
                <span>£{bookingData.serviceMin} – £{bookingData.serviceMax}</span>
              </div>
            )}
            {bookingData.remoteSurcharge > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Remote area surcharge</span>
                <span>+£{bookingData.remoteSurcharge}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total Estimate</span>
              <span>£{bookingData.estMin} – £{bookingData.estMax}</span>
            </div>
          </div>

          <p className={`text-xs p-2 rounded flex items-start gap-2 ${
            hasPhotos ? 'text-amber-700 bg-amber-50' : 'text-orange-700 bg-orange-50 font-medium'
          }`}>
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            {hasPhotos
              ? 'This is an estimate. Final price confirmed on-site after inspection.'
              : 'Preliminary estimate only — upload photos for a more accurate quote. Final price confirmed on-site.'}
          </p>
        </div>
      ) : (
        <div className="border border-gray-100 rounded-xl p-4 text-center text-gray-400 text-sm">
          Price estimate not available — please go back and enter your postcode.
        </div>
      )}

      {/* 信息核对列表 */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {reviewItems.map((item, index) => (
          <div
            key={item.label}
            className={`p-3 flex items-start gap-3 ${
              index !== reviewItems.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <item.icon size={16} className="mt-0.5 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-gray-800 mt-0.5 break-words">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white py-3.5 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm"
      >
        Submit Booking
      </button>

      <p className="text-xs text-gray-400 text-center">
        By submitting, you agree to be contacted regarding your booking request.
      </p>
    </div>
  );
}