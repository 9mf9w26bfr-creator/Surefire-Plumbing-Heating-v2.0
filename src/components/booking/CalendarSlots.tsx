'use client';
import React from 'react';
import { Clock } from 'lucide-react';

interface CalendarSlotsProps {
  slots: { id: string; label: string }[];
  selectedSlotId: string;
  onSelectSlot: (slotId: string) => void;
  isSunday?: boolean;
}

export default function CalendarSlots({
  slots,
  selectedSlotId,
  onSelectSlot,
  isSunday = false,
}: CalendarSlotsProps) {
  if (isSunday) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-center">
        <p className="text-amber-800 font-semibold text-sm">Sunday — By Appointment Only</p>
        <p className="text-xs text-amber-700 mt-1">Please call our emergency line directly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center font-semibold text-sm text-gray-900 mb-2">
        <Clock size={16} className="mr-1.5 text-blue-600" />
        Select Time Slot
      </label>
      <div className="space-y-2">
        {slots.map((slot) => (
          <button
            key={slot.id}
            type="button"
            onClick={() => onSelectSlot(slot.id)}
            className={`w-full p-3 rounded-lg border text-left text-sm transition-colors ${
              selectedSlotId === slot.id
                ? 'border-blue-600 bg-blue-50 font-medium text-blue-900 shadow-2xs'
                : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
            }`}
          >
            {slot.label}
          </button>
        ))}
      </div>
    </div>
  );
}
