'use client';
import Link from 'next/link';
import { ArrowLeft, Shield, Sliders, MapPin, PoundSterling, Mail } from 'lucide-react';
import { SERVICE_AREAS } from '@/config/serviceArea';
import { SERVICE_BASE_PRICE } from '@/config/pricing';

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-[#0F2B4A]">Platform Settings &amp; Rules</h1>
      </div>

      {/* Pricing Rules */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 text-blue-900 font-semibold border-b pb-2">
          <PoundSterling size={18} />
          <h2>Pricing &amp; Call-Out Parameters</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500 text-xs block">Standard Call-Out Fee</span>
            <span className="text-lg font-bold text-gray-900">&pound;40</span>
            <span className="text-xs text-gray-500 block mt-0.5">Applies within 10 miles</span>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-gray-500 text-xs block">Online Upfront Estimate</span>
            <span className="text-lg font-bold text-green-700">100% Free</span>
            <span className="text-xs text-gray-500 block mt-0.5">Calculated before booking</span>
          </div>
        </div>

        <div className="text-xs space-y-1.5 text-gray-600">
          <p className="font-semibold text-gray-700">Base Service Rates:</p>
          {Object.entries(SERVICE_BASE_PRICE).map(([key, val]) => (
            <div key={key} className="flex justify-between py-1 border-b border-gray-100">
              <span className="capitalize">{key}</span>
              <span className="font-mono font-medium">&pound;{val.min} &ndash; &pound;{val.max} / {val.unit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage Areas */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2 text-blue-900 font-semibold border-b pb-2">
          <MapPin size={18} />
          <h2>Configured Service Zones</h2>
        </div>
        <div className="space-y-2">
          {Object.entries(SERVICE_AREAS).map(([key, area]) => (
            <div key={key} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm">
              <div>
                <span className="font-semibold text-gray-900">{area.region}</span>
                <span className="text-xs text-gray-500 ml-2">({area.postcodePrefixes.join(', ') || 'Selected'})</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                area.status === 'active' ? 'bg-green-100 text-green-800' :
                area.status === 'conditional' ? 'bg-amber-100 text-amber-800' :
                'bg-gray-100 text-gray-500'
              }`}>
                {area.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-2xs text-sm">
        <div className="flex items-center gap-2 text-blue-900 font-semibold border-b pb-2">
          <Mail size={18} />
          <h2>Email &amp; Storage Integrations</h2>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <span>Resend Email Service</span>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono">Free Tier Ready</span>
        </div>
        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
          <span>Photo Upload Storage</span>
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded font-mono">Local Static (/public/uploads)</span>
        </div>
        <div className="flex justify-between items-center py-1.5">
          <span>Database ORM</span>
          <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono">Prisma v5.22 + JSON Resilience</span>
        </div>
      </div>
    </div>
  );
}
