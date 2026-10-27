'use client';
import React from 'react';
import { Droplets, ThermometerSun, Wrench, Settings } from 'lucide-react';

interface ServiceSelectorProps {
  selectedService: string;
  onSelect: (serviceId: string) => void;
}

const services = [
  { id: 'emergency-plumbing', name: 'Emergency Plumbing', icon: Droplets, desc: 'Leaks, burst pipes & urgent call-outs' },
  { id: 'boiler-heating', name: 'Boiler & Heating', icon: ThermometerSun, desc: 'Installation, repairs & annual servicing' },
  { id: 'general-repairs', name: 'General Repairs', icon: Wrench, desc: 'Taps, toilets & domestic fixtures' },
  { id: 'maintenance', name: 'Plumbing Maintenance', icon: Settings, desc: 'Landlord safety checks & inspections' },
];

export default function ServiceSelector({ selectedService, onSelect }: ServiceSelectorProps) {
  return (
    <div className="space-y-3">
      {services.map(svc => {
        const Icon = svc.icon;
        const isChosen = selectedService === svc.id;
        return (
          <button
            key={svc.id}
            type="button"
            onClick={() => onSelect(svc.id)}
            className={`w-full flex items-center gap-4 p-4 border rounded-xl transition-all text-left ${
              isChosen
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isChosen ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-500'
            }`}>
              <Icon size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{svc.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{svc.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
