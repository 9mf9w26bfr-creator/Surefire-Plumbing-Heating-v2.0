'use client';
import React from 'react';
import { Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { EstimateResult } from '@/config/pricing';

interface PriceEstimateDisplayProps {
  estimate: EstimateResult | null;
  coverageMessage?: string;
  isCovered?: boolean;
}

export default function PriceEstimateDisplay({
  estimate,
  coverageMessage,
  isCovered = true,
}: PriceEstimateDisplayProps) {
  if (!estimate) {
    return (
      <div className="border border-gray-100 rounded-xl p-4 text-center text-gray-400 text-sm">
        Enter your postcode to see free upfront estimate
      </div>
    );
  }

  return (
    <div className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator size={18} className="text-blue-700" />
          <h3 className="font-bold text-base text-blue-900">Free Price Estimate</h3>
        </div>
        <span className="text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">
          Free Upfront
        </span>
      </div>

      <div className="text-center py-2">
        <span className="text-3xl font-bold text-blue-900">£{estimate.priceMin}</span>
        <span className="text-lg text-gray-400 mx-2">–</span>
        <span className="text-3xl font-bold text-blue-900">£{estimate.priceMax}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Confidence: {estimate.confidence}%</span>
        <span>Includes &pound;40 local call-out fee</span>
      </div>

      {coverageMessage && (
        <div className={`text-xs p-2.5 rounded-lg flex items-start gap-1.5 ${
          isCovered ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {isCovered ? <CheckCircle size={13} className="mt-0.5 shrink-0 text-green-600" /> : <AlertCircle size={13} className="mt-0.5 shrink-0 text-amber-600" />}
          <span>{coverageMessage}</span>
        </div>
      )}
    </div>
  );
}
