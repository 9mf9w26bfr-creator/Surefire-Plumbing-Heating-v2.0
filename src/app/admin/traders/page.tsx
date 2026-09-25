'use client';
import { useState } from 'react';
import { Users, Phone, Mail, Plus, X } from 'lucide-react';

interface Trader {
  id: string;
  name: string;
  phone: string;
  email: string;
  active: boolean;
}

export default function TradersPage() {
  const [traders, setTraders] = useState<Trader[]>([
    { id: '1', name: 'Senior Engineer', phone: '—', email: 'info@surefire-plumbing.co.uk', active: true }
  ]);
  const [newTrader, setNewTrader] = useState({ name: '', phone: '', email: '' });

  const addTrader = () => {
    if (newTrader.name.trim()) {
      setTraders([...traders, {
        id: Date.now().toString(),
        ...newTrader,
        active: true
      }]);
      setNewTrader({ name: '', phone: '', email: '' });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#0F2B4A]">Traders / Team</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-sm text-gray-500">Add New Team Member</h3>
        <input
          type="text"
          placeholder="Name"
          value={newTrader.name}
          onChange={(e) => setNewTrader({ ...newTrader, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm"
        />
        <input
          type="tel"
          placeholder="Phone"
          value={newTrader.phone}
          onChange={(e) => setNewTrader({ ...newTrader, phone: e.target.value })}
          className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm"
        />
        <input
          type="email"
          placeholder="Email"
          value={newTrader.email}
          onChange={(e) => setNewTrader({ ...newTrader, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-100 rounded-lg text-sm"
        />
        <button
          onClick={addTrader}
          className="w-full py-2 bg-[#0F2B4A] text-white rounded-lg text-sm flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Add Member
        </button>
      </div>

      <div className="space-y-3">
        {traders.map(t => (
          <div key={t.id} className="p-4 bg-white border border-gray-100 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{t.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${t.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {t.active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2"><Phone size={12} /> {t.phone || '—'}</p>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2"><Mail size={12} /> {t.email || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}