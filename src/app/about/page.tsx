'use client';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="space-y-6 py-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">About Us</h1>
      
      <div className="space-y-4 text-gray-700">
        <p>
          <strong>Surefire Plumbing &amp; Heating</strong> is a family-run local business 
          serving North West England with over 20 years of hands-on experience.
        </p>
        <p>
          We cover Liverpool, Merseyside, Cheshire, Warrington, St Helens, Runcorn, 
          Widnes and selected areas of Greater Manchester.
        </p>
        <ul className="list-disc list-inside space-y-2">
          <li>Gas Safe registered &amp; fully qualified engineers</li>
          <li>Fully insured with 20+ years local professional experience</li>
          <li>Free upfront online estimates</li>
          <li>Transparent pricing: standard &pound;40 local call-out fee applied when attending on-site*</li>
        </ul>
        <p className="text-sm text-gray-500">
          *Standard call-out fee applies within 10 miles. Remote area surcharge may apply to outer regions.
        </p>
      </div>

      <Link 
        href="/" 
        className="inline-block text-blue-600 hover:underline"
      >
        &larr; Back to Home
      </Link>
    </div>
  );
}
