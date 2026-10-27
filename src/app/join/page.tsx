'use client';
import TraderApplicationForm from '@/components/join/TraderApplicationForm';

export default function JoinPage() {
  return (
    <div className="space-y-6 py-4 max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Join Our Team &amp; Trader Network</h1>
        <p className="text-gray-600 mt-1">
          We partner with skilled, certified plumbing and heating engineers across North West England.
        </p>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl space-y-3">
        <h2 className="font-semibold text-blue-900 text-sm uppercase tracking-wider">What We Offer Partner Engineers</h2>
        <ul className="space-y-1.5 text-xs text-blue-800">
          <li>&bull; Regular qualified job dispatches across Liverpool, Merseyside, Cheshire &amp; Warrington</li>
          <li>&bull; Fair, transparent commission rates &amp; prompt weekly settlement</li>
          <li>&bull; Backed by 20+ years established local brand reputation</li>
          <li>&bull; Dedicated customer support handling upfront triage and bookings</li>
        </ul>
      </div>

      <TraderApplicationForm />

      <div className="border-t pt-4 text-center text-xs text-gray-400">
        Direct recruitment queries: <span className="font-mono text-gray-600">join@surefireplumbingheating.co.uk</span>
      </div>
    </div>
  );
}
