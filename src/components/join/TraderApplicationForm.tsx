'use client';
import { useState } from 'react';
import { User, Phone, Mail, MapPin, Briefcase, Award, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';

export default function TraderApplicationForm() {
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    tradeType: 'Plumbing & Heating',
    email: '',
    phone: '',
    postcode: '',
    serviceAreaNote: '',
    experienceYears: '5',
    insuranceRef: '',
    gasSafeNum: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/join/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: formData.businessName || formData.contactName,
          contactName: formData.contactName,
          tradeType: formData.tradeType,
          email: formData.email,
          phone: formData.phone,
          postcode: formData.postcode,
          serviceAreaNote: formData.serviceAreaNote,
          experienceYears: parseInt(formData.experienceYears, 10) || 0,
          insuranceRef: formData.insuranceRef,
          qualifications: formData.gasSafeNum ? [`Gas Safe: ${formData.gasSafeNum}`] : [],
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to submit application.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3">
        <CheckCircle size={48} className="mx-auto text-green-600" />
        <h3 className="text-xl font-bold text-green-900">Application Submitted!</h3>
        <p className="text-sm text-green-700">
          Thank you, <strong>{formData.contactName}</strong>. Our operations team reviews all engineer applications and will get in touch on <strong>{formData.phone}</strong> within 3 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="border-b pb-3 mb-2">
        <h3 className="font-bold text-gray-900 text-lg">Partner Engineer Application</h3>
        <p className="text-xs text-gray-500">Join our trusted network across North West England</p>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg font-medium">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Your Full Name *</label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              placeholder="e.g. David Walker"
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Business / Trading Name</label>
          <input
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            placeholder="e.g. DW Heating Solutions"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="david@example.co.uk"
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Phone *</label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="07123 456789"
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Base Postcode *</label>
          <div className="relative">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="postcode"
              value={formData.postcode}
              onChange={handleChange}
              placeholder="e.g. L3 4FP"
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm uppercase"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Trade Specialism</label>
          <select
            name="tradeType"
            value={formData.tradeType}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
          >
            <option>Plumbing &amp; Heating</option>
            <option>Gas &amp; Boiler Specialist</option>
            <option>Emergency Plumbing</option>
            <option>General Domestic Plumbing</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Experience (Years)</label>
          <input
            name="experienceYears"
            type="number"
            min="1"
            value={formData.experienceYears}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Gas Safe Register Number</label>
          <div className="relative">
            <Award size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="gasSafeNum"
              value={formData.gasSafeNum}
              onChange={handleChange}
              placeholder="6-7 digits (if applicable)"
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Public Liability Insurance Ref</label>
          <div className="relative">
            <ShieldCheck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="insuranceRef"
              value={formData.insuranceRef}
              onChange={handleChange}
              placeholder="Policy / Insurer reference"
              className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Coverage Areas / Towns Preferred</label>
        <textarea
          name="serviceAreaNote"
          value={formData.serviceAreaNote}
          onChange={handleChange}
          placeholder="e.g. Liverpool, Sefton, Kirkby, St Helens, Widnes"
          rows={2}
          className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0F2B4A] text-white py-3 rounded-xl font-semibold hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Submitting Application…</span>
          </>
        ) : (
          <span>Submit Partner Application</span>
        )}
      </button>
    </form>
  );
}
