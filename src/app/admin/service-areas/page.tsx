'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Plus, X, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { SERVICE_AREAS } from '@/config/serviceArea';

export default function ServiceAreasPage() {
  const [areas, setAreas] = useState(
    Object.values(SERVICE_AREAS).map(a => ({
      region: a.region,
      status: a.status,
      postcodes: a.postcodePrefixes.join(', '),
      weight: a.travelTimeWeight,
    }))
  );
  const [newAreaName, setNewAreaName] = useState('');
  const [newAreaPrefix, setNewAreaPrefix] = useState('');

  const addArea = () => {
    if (newAreaName.trim()) {
      setAreas([
        ...areas,
        {
          region: newAreaName.trim(),
          status: 'active',
          postcodes: newAreaPrefix.trim().toUpperCase() || 'NW',
          weight: 1.0,
        },
      ]);
      setNewAreaName('');
      setNewAreaPrefix('');
    }
  };

  const toggleStatus = (idx: number) => {
    setAreas(prev => {
      const copy = [...prev];
      copy[idx].status = copy[idx].status === 'active' ? 'inactive' : 'active';
      return copy;
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-gray-500 hover:text-gray-800">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-2xl font-bold text-[#0F2B4A]">Service Areas &amp; Coverage</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-2xs">
        <h3 className="font-semibold text-sm text-gray-700">Add Service Expansion Region</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            placeholder="Region Name (e.g. Southport)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            type="text"
            value={newAreaPrefix}
            onChange={(e) => setNewAreaPrefix(e.target.value)}
            placeholder="Postcode Prefixes (e.g. PR8, PR9)"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase"
          />
        </div>
        <button
          onClick={addArea}
          className="w-full py-2.5 bg-[#0F2B4A] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Expansion Zone
        </button>
      </div>

      <div className="space-y-2.5">
        {areas.map((area, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3.5 bg-white border border-gray-200 rounded-xl shadow-2xs"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-blue-700" />
                <span className="font-semibold text-gray-900">{area.region}</span>
                <span className="text-xs text-gray-400 font-mono">Weight: {area.weight}</span>
              </div>
              <p className="text-xs text-gray-500 pl-6">
                Prefixes: <span className="font-medium text-gray-700">{area.postcodes || 'None configured'}</span>
              </p>
            </div>
            
            <button
              onClick={() => toggleStatus(idx)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                area.status === 'active'
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {area.status === 'active' ? 'Active' : 'Inactive'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
