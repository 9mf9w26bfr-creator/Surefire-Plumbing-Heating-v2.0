'use client';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="space-y-6 py-4">
      <h1 className="text-2xl font-bold text-primary">About Us</h1>
      
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
          <li>Fully qualified &amp; insured</li>
          <li>Gas Safe registered</li>
          <li>Local engineers — no call-out fee*</li>
          <li>Transparent pricing upfront</li>
        </ul>
        <p className="text-sm text-gray-500">
          *Within standard service zones; charges may apply to outer areas.
        </p>
      </div>

      <Link 
        href="/" 
        className="inline-block text-blue-600 hover:underline"
      >
        ← Back to Home
      </Link>
    </div>
  );
}