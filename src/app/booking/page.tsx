'use client';
import Link from 'next/link';
import { Wrench, Droplets, ThermometerSun, Settings } from 'lucide-react';

const services = [
  {
    id: 'emergency-plumbing',
    name: 'Emergency Plumbing',
    icon: Droplets,
    description: 'Leaks, bursts & urgent repairs',
  },
  {
    id: 'boiler-heating',
    name: 'Boiler & Heating',
    icon: ThermometerSun,
    description: 'Installation, repairs & servicing',
  },
  {
    id: 'general-repairs',
    name: 'General Repairs',
    icon: Wrench,
    description: 'Taps, toilets & fixtures',
  },
  {
    id: 'maintenance',
    name: 'Plumbing Maintenance',
    icon: Settings,
    description: 'Planned checks & prevention',
  },
];

export default function BookingHomePage() {
  return (
    <div className="space-y-6 py-4 max-w-md mx-auto px-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Choose a Service</h1>
        <p className="text-gray-600 mt-1">What can we help you with today?</p>
      </div>

      <div className="space-y-3">
        {services.map((svc) => {
          const Icon = svc.icon;
          return (
            <Link
              key={svc.id}
              href={`/booking/datetime?service=${encodeURIComponent(svc.id)}`}
              className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all bg-white hover:border-blue-200"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-blue-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{svc.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{svc.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}