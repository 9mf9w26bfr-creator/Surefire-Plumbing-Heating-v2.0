'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft, User, MapPin, Phone, FileText,
  Upload, X, Image as ImageIcon, Calculator, AlertCircle
} from 'lucide-react';
import { generateEstimate, type EstimateResult } from '@/config/pricing';

export default function DetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 读取上游参数
  const service = searchParams.get('service') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';

  // 🔐 参数校验 — 缺失则返回预约入口
  useEffect(() => {
    if (!service || !date || !time) {
      router.replace('/booking');
    }
  }, [service, date, time, router]);

  // 参数缺失时显示加载状态
  if (!service || !date || !time) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>Missing booking details — redirecting…</p>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    postcode: '',
    notes: '',
  });

  const [images, setImages] = useState<{ id: string; preview: string }[]>([]);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 9;

  // 自动计算估价 — 依赖稳定后执行
  useEffect(() => {
    if (!formData.postcode || formData.postcode.length < 4) {
      setEstimate(null);
      return;
    }
    const result = generateEstimate({
      serviceType: service,
      postcode: formData.postcode,
      description: formData.notes,
      imageCount: images.length,
      timeSlot: time,
      isEmergency: service === 'emergency-plumbing', // 修正匹配值
    });
    setEstimate(result);
  }, [service, formData.postcode, formData.notes, images.length, time]);

  // 表单统一更新
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 图片选择处理
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      alert(`Maximum ${MAX_IMAGES} photos allowed`);
      return;
    }

    Array.from(files).slice(0, remaining).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(prev => [...prev, {
          id: Math.random().toString(36).slice(2, 9),
          preview: ev.target?.result as string,
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = ''; // 重置以便重复选择同文件
  };

  // 移除单张图片
  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  // 提交条件校验
  const canSubmit = !!formData.name && !!formData.phone && !!formData.address && !!formData.postcode;

  // 提交并跳转确认页
  const handleSubmit = () => {
    if (!canSubmit || !estimate) return;

    const params = new URLSearchParams({
      service,
      date,
      time,
      ...formData,
      imageCount: String(images.length),
      estMin: String(estimate.priceMin),
      estMax: String(estimate.priceMax),
      callOutFee: String(estimate.breakdown.callOutFee),
      serviceMin: String(estimate.breakdown.serviceMin),
      serviceMax: String(estimate.breakdown.serviceMax),
      remoteSurcharge: String(estimate.breakdown.remoteSurcharge),
    });

    router.push(`/booking/confirm?${params.toString()}`);
  };

  return (
    <div className="space-y-6 py-4 max-w-md mx-auto">
      {/* 返回按钮 */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-blue-700 text-sm"
      >
        <ChevronLeft size={16} className="mr-1" />
        Back to Date & Time
      </button>

      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Your Details & Estimate</h1>
        <p className="text-gray-600 mt-1">Step 3 — See your price range as you fill in</p>
      </div>

      {/* 预约摘要 */}
      <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-sm">
        <p className="flex justify-between">
          <span className="text-gray-500">Service</span>
          <span className="font-medium capitalize">{service.replace(/-/g, ' ')}</span>
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

      {/* 💰 实时估价卡片 */}
      {estimate ? (
        <div className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Calculator size={20} className="text-blue-700" />
            <h3 className="font-bold text-lg text-blue-900">Estimated Price Range</h3>
          </div>
          
          <div className="text-center py-2">
            <span className="text-3xl font-bold text-blue-900">£{estimate.priceMin}</span>
            <span className="text-lg text-gray-500 mx-2">–</span>
            <span className="text-3xl font-bold text-blue-900">£{estimate.priceMax}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Confidence: {estimate.confidence}%</span>
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
              <span key={i} className="bg-white px-2 py-1 rounded">{f}</span>
            ))}
          </div>
          
          <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2 flex items-start gap-2">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            {estimate.disclaimer}
          </p>
        </div>
      ) : (
        <div className="border border-gray-100 rounded-xl p-4 text-center text-gray-400 text-sm">
          Enter your postcode to see estimated price range
        </div>
      )}

      {/* 表单区域 */}
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="flex items-center text-sm font-medium mb-1.5">
            <User size={14} className="mr-1.5 text-gray-500" />
            Full Name *
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-1.5">
            <Phone size={14} className="mr-1.5 text-gray-500" />
            Phone Number *
          </label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Your contact number"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-1.5">
            <MapPin size={14} className="mr-1.5 text-gray-500" />
            Address *
          </label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Property address"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-1.5">
            <MapPin size={14} className="mr-1.5 text-gray-500" />
            Postcode *
          </label>
          <input
            name="postcode"
            value={formData.postcode}
            onChange={handleChange}
            placeholder="e.g. L1 1AA"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 📸 图片上传区 */}
        <div>
          <label className="flex items-center text-sm font-medium mb-1.5">
            <ImageIcon size={14} className="mr-1.5 text-gray-500" />
            Photos ({images.length}/{MAX_IMAGES}) — helps refine estimate
          </label>
          
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {images.map(img => (
                <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border">
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
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
                className="w-full border-2 border-dashed border-gray-200 rounded-lg p-4 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Upload size={18} />
                {images.length === 0 ? 'Upload Photos' : `Add More (${MAX_IMAGES - images.length} left)`}
              </button>
            </>
          )}
          
          <p className="text-xs text-gray-400 mt-1">
            Clear photos help us narrow the estimate — up to {MAX_IMAGES}
          </p>
        </div>

        <div>
          <label className="flex items-center text-sm font-medium mb-1.5">
            <FileText size={14} className="mr-1.5 text-gray-500" />
            Additional Details
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Describe the issue — e.g. 'Leaking pipe under kitchen sink'"
            rows={3}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </form>

      {/* 提交按钮 */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || !estimate}
        className="w-full bg-blue-700 text-white py-3.5 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors shadow-sm"
      >
        Review Booking →
      </button>
    </div>
  );
}