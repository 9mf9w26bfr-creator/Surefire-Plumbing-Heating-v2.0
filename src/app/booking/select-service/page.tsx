'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Wrench, Droplets, ThermometerSun, Settings, ChevronRight } from 'lucide-react';

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

export default function SelectServicePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedParam = searchParams.get('service') || '';
  const [selected, setSelected] = useState(selectedParam);

  const handleNext = () => {
    if (!selected) return;
    router.push(`/booking/select-slot?service=${selected}`);
  };

  return (
    <div className="space-y-6 py-4 max-w-md mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-primary">Select Service</h1>
        <p className="text-gray-600 mt-1">Choose the type of service you need</p>
      </div>

      <div className="space-y-3">
        {services.map((svc) => {
          const Icon = svc.icon;
          const isChosen = selected === svc.id;
          return (
            <button
              key={svc.id}
              type="button"
              onClick={() => setSelected(svc.id)}
              className={`w-full flex items-center gap-4 p-4 border rounded-xl transition-all text-left ${
                isChosen
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isChosen ? 'bg-blue-100' : 'bg-gray-50'
              }`}>
                <Icon size={20} className={isChosen ? 'text-blue-700' : 'text-gray-500'} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{svc.name}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{svc.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={!selected}
        className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue <ChevronRight size={18} />
      </button>
    </div>
  );
}