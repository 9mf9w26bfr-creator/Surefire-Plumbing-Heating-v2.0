'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Phone, Mail, Plus, MapPin, ArrowLeft, RefreshCw, Award, ShieldCheck } from 'lucide-react';

interface Trader {
  id: string;
  businessName: string;
  contactName: string;
  tradeType: string;
  email: string;
  phone: string;
  postcode: string;
  serviceAreaNote?: string;
  qualifications?: string[];
  status?: string;
  active: boolean;
}

export default function TradersPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTrader, setNewTrader] = useState({ name: '', phone: '', email: '', postcode: 'L1' });

  const fetchTraders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/join/application');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.traders)) {
          setTraders(data.traders);
          setLoading(false);
          return;
        }
      }
    } catch {}

    setTraders([
      {
        id: '1',
        businessName: 'Surefire Lead Engineer',
        contactName: 'Senior Heating Specialist',
        tradeType: 'Gas & Boilers',
        phone: '07123 456789',
        email: 'info@surefire-plumbing.co.uk',
        postcode: 'L1',
        active: true,
      },
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTraders();
  }, []);

  const addTrader = async () => {
    if (newTrader.name.trim() && newTrader.email.trim()) {
      try {
        await fetch('/api/join/application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactName: newTrader.name,
            phone: newTrader.phone,
            email: newTrader.email,
            postcode: newTrader.postcode,
          }),
        });
      } catch {}

      setNewTrader({ name: '', phone: '', email: '', postcode: 'L1' });
      fetchTraders();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="text-gray-500 hover:text-gray-800">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-[#0F2B4A]">Engineers &amp; Trader Applications</h1>
        </div>
        <button
          onClick={fetchTraders}
          className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-2xs">
        <h3 className="font-semibold text-sm text-gray-700">Quick Add Team Member / Engineer</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Engineer Name"
            value={newTrader.name}
            onChange={(e) => setNewTrader({ ...newTrader, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={newTrader.phone}
            onChange={(e) => setNewTrader({ ...newTrader, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="email"
            placeholder="Email Address"
            value={newTrader.email}
            onChange={(e) => setNewTrader({ ...newTrader, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="Postcode (e.g. WA1)"
            value={newTrader.postcode}
            onChange={(e) => setNewTrader({ ...newTrader, postcode: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm uppercase"
          />
        </div>
        <button
          onClick={addTrader}
          className="w-full py-2.5 bg-[#0F2B4A] text-white rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Team Member
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 py-6">Loading engineers…</p>
        ) : traders.length === 0 ? (
          <p className="text-center text-gray-400 py-6">No engineer records or applications yet.</p>
        ) : (
          traders.map(t => (
            <div key={t.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900">{t.contactName || t.businessName}</span>
                  {t.businessName && t.businessName !== t.contactName && (
                    <span className="text-xs text-gray-500 ml-2">({t.businessName})</span>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  t.status === 'VERIFIED' || t.active ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {t.status || (t.active ? 'Active' : 'Under Review')}
                </span>
              </div>
              <p className="text-xs text-blue-700 font-medium">{t.tradeType}</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-1">
                <p className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400" /> {t.phone || '—'}</p>
                <p className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400" /> {t.email || '—'}</p>
                <p className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-400" /> {t.postcode || 'North West'}</p>
                {t.qualifications && t.qualifications.length > 0 && (
                  <p className="flex items-center gap-1.5"><Award size={12} className="text-blue-600" /> {t.qualifications.join(', ')}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
