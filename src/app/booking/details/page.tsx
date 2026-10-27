'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  ChevronLeft, User, MapPin, Phone, FileText,
  Upload, X, Image as ImageIcon, Calculator, AlertCircle, CheckCircle, Mail, Loader2
} from 'lucide-react';
import { generateEstimate, type EstimateResult } from '@/config/pricing';
import { getCoverageDetail, type CoverageDetail } from '@/utils/serviceAreaEngine';
import { getCurrentUser } from '@/lib/authStore';

function DetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const service = searchParams.get('service') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    postcode: '',
    notes: '',
  });

  const [images, setImages] = useState<{ id: string; preview: string; url?: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [coverage, setCoverage] = useState<CoverageDetail | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 9;

  // Pre-fill user if logged in
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, []);

  // Redirect if missing params
  useEffect(() => {
    if (!service || !date || !time) {
      router.replace('/booking');
    }
  }, [service, date, time, router]);

  // Recalculate estimate and coverage when postcode/details change
  useEffect(() => {
    if (!formData.postcode || formData.postcode.trim().length < 2) {
      setEstimate(null);
      setCoverage(null);
      return;
    }

    const cov = getCoverageDetail(formData.postcode);
    setCoverage(cov);

    const result = generateEstimate({
      serviceType: service,
      postcode: formData.postcode,
      description: formData.notes,
      imageCount: images.length,
      timeSlot: time,
      isEmergency: service === 'emergency-plumbing',
    });
    setEstimate(result);
  }, [service, formData.postcode, formData.notes, images.length, time]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      alert(`Maximum ${MAX_IMAGES} photos allowed`);
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remaining);
    setIsUploading(true);

    try {
      // 1. Create local previews immediately
      const newItems = selectedFiles.map(file => ({
        id: Math.random().toString(36).slice(2, 9),
        preview: URL.createObjectURL(file),
      }));
      setImages(prev => [...prev, ...newItems]);

      // 2. Upload to server API for persistent local hosting
      const uploadData = new FormData();
      selectedFiles.forEach(f => uploadData.append('files', f));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.urls)) {
          setImages(prev => {
            const updated = [...prev];
            data.urls.forEach((url: string, idx: number) => {
              const targetIndex = updated.length - selectedFiles.length + idx;
              if (updated[targetIndex]) {
                updated[targetIndex].url = url;
              }
            });
            return updated;
          });
        }
      }
    } catch (err) {
      console.warn('[Image Upload Warning, using local previews]', err);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const canSubmit = Boolean(formData.name && formData.phone && formData.address && formData.postcode && !isUploading);

  const handleSubmit = () => {
    if (!canSubmit || !estimate) return;

    const uploadedUrls = images.map(img => img.url).filter(Boolean);

    const params = new URLSearchParams({
      service,
      date,
      time,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      postcode: formData.postcode.toUpperCase().trim(),
      notes: formData.notes,
      imageCount: String(images.length),
      photoUrls: JSON.stringify(uploadedUrls),
      estMin: String(estimate.priceMin),
      estMax: String(estimate.priceMax),
      callOutFee: String(estimate.breakdown.callOutFee),
      serviceMin: String(estimate.breakdown.serviceMin),
      serviceMax: String(estimate.breakdown.serviceMax),
      remoteSurcharge: String(estimate.breakdown.remoteSurcharge),
    });

    router.push(`/booking/confirm?${params.toString()}`);
  };

  if (!service || !date || !time) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>Missing booking details — redirecting…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 max-w-md mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-blue-700 text-sm"
      >
        <ChevronLeft size={16} className="mr-1" />
        Back to Date &amp; Time
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Details &amp; Estimate</h1>
        <p className="text-gray-600 mt-1">Step 3 — Free upfront online estimate</p>
      </div>

      {/* Booking summary */}
      <div className="bg-blue-50 p-4 rounded-xl space-y-2 text-sm border border-blue-100">
        <p className="flex justify-between">
          <span className="text-gray-500">Service</span>
          <span className="font-semibold text-blue-900 capitalize">{service.replace(/-/g, ' ')}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-500">Date</span>
          <span className="font-medium">{date}</span>
        </p>
        <p className="flex justify-between">
          <span className="text-gray-500">Time</span>
          <span className="font-medium">{time}</span>
        </p>
      </div>

      {/* Realtime Estimate Card */}
      {estimate ? (
        <div className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={20} className="text-blue-700" />
              <h3 className="font-bold text-lg text-blue-900">Free Price Estimate</h3>
            </div>
            <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">
              Free Upfront
            </span>
          </div>
          
          <div className="text-center py-2">
            <span className="text-3xl font-bold text-blue-900">£{estimate.priceMin}</span>
            <span className="text-lg text-gray-500 mx-2">–</span>
            <span className="text-3xl font-bold text-blue-900">£{estimate.priceMax}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Estimate Confidence: {estimate.confidence}%</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              estimate.confidence >= 85 ? 'bg-green-100 text-green-700' :
              estimate.confidence >= 70 ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {estimate.confidence >= 85 ? 'High' : estimate.confidence >= 70 ? 'Medium' : 'Indicative'}
            </span>
          </div>
          
          <div className="text-xs text-gray-500 flex flex-wrap gap-2">
            {estimate.factors.map((f, i) => (
              <span key={i} className="bg-white px-2 py-1 rounded shadow-2xs">{f}</span>
            ))}
          </div>

          {coverage && (
            <div className={`text-xs p-2.5 rounded-lg flex items-start gap-2 ${
              coverage.isCovered ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {coverage.isCovered ? (
                <CheckCircle size={14} className="mt-0.5 shrink-0 text-green-600" />
              ) : (
                <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-600" />
              )}
              <span>{coverage.message}</span>
            </div>
          )}
          
          <p className="text-xs text-blue-800 bg-white/70 p-2.5 rounded mt-2 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-blue-600" />
            Standard &pound;40 local call-out fee is included when technician attends on-site. Final quote confirmed after inspection.
          </p>
        </div>
      ) : (
        <div className="border border-gray-100 rounded-xl p-4 text-center text-gray-400 text-sm">
          Enter your postcode to see free estimated price range
        </div>
      )}

      {/* Form Fields */}
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="flex items-center text-sm font-medium mb-1.5 text-gray-700">
            <User size={14} className="mr-1.5 text-gray-500" />
            Full Name *
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-1.5 text-gray-700">
            <Mail size={14} className="mr-1.5 text-gray-500" />
            Email Address (for booking confirmation)
          </label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-1.5 text-gray-700">
            <Phone size={14} className="mr-1.5 text-gray-500" />
            Phone Number *
          </label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. 07123 456789"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-1.5 text-gray-700">
            <MapPin size={14} className="mr-1.5 text-gray-500" />
            Address *
          </label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Property street address"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-1.5 text-gray-700">
            <MapPin size={14} className="mr-1.5 text-gray-500" />
            Postcode *
          </label>
          <input
            name="postcode"
            value={formData.postcode}
            onChange={handleChange}
            placeholder="e.g. L1 1AA, WA1 2BB, CH1 3CC"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            required
          />
        </div>

        {/* Photos Upload */}
        <div>
          <label className="flex items-center text-sm font-medium mb-1.5 text-gray-700">
            <ImageIcon size={14} className="mr-1.5 text-gray-500" />
            Photos ({images.length}/{MAX_IMAGES}) &mdash; helps refine estimate
          </label>
          
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {images.map(img => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50">
                  <Image 
                    src={img.preview} 
                    alt="Uploaded issue preview" 
                    fill 
                    className="object-cover" 
                    unoptimized 
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors z-10"
                    aria-label="Remove photo"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {images.length < MAX_IMAGES && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full border-2 border-dashed border-gray-200 rounded-lg p-4 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-blue-600" />
                    <span>Uploading photos…</span>
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    <span>{images.length === 0 ? 'Upload Photos' : `Add More (${MAX_IMAGES - images.length} left)`}</span>
                  </>
                )}
              </button>
            </>
          )}
          
          <p className="text-xs text-gray-400 mt-1">
            Clear photos help us narrow down the issue upfront &mdash; up to {MAX_IMAGES}
          </p>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-1.5 text-gray-700">
            <FileText size={14} className="mr-1.5 text-gray-500" />
            Additional Details
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Describe the issue &mdash; e.g. 'Leaking pipe under kitchen sink'"
            rows={3}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </form>

      {/* Review Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || !estimate}
        className="w-full bg-blue-700 text-white py-3.5 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors shadow-sm"
      >
        Review Booking &rarr;
      </button>
    </div>
  );
}

export default function DetailsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading booking form...</div>}>
      <DetailsContent />
    </Suspense>
  );
}
