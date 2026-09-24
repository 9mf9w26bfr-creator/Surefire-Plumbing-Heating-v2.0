'use client';
import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format, addMonths, startOfDay, isBefore, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

// ==============================================
// ⚙️ 营业时间配置
// ==============================================
const ALL_SLOTS = [
  { id: 'morning', label: 'Morning — 08:00–12:00', days: [1, 2, 3, 4, 5] },   // Mon–Fri
  { id: 'afternoon', label: 'Afternoon — 12:00–18:00', days: [1, 2, 3, 4, 5] }, // Mon–Fri
  { id: 'saturday', label: 'Saturday — 08:00–13:00', days: [6] },              // Sat only
];

export default function DateTimePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const service = searchParams.get('service') || '';

  if (!service) {
    router.replace('/booking');
    return null;
  }

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    return ALL_SLOTS.filter(slot => slot.days.includes(dayOfWeek));
  }, [selectedDate]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    
    const days: Array<{
      date: Date | null;
      isCurrentMonth: boolean;
      isDisabled: boolean;
      isSunday: boolean;
    }> = [];

    for (let i = 0; i < startDay; i++) {
      days.push({ date: null, isCurrentMonth: false, isDisabled: true, isSunday: false });
    }

    const today = startOfDay(new Date());
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = date.getDay();
      days.push({
        date,
        isCurrentMonth: true,
        isDisabled: isBefore(date, today) || isSameDay(date, today),
        isSunday: dayOfWeek === 0,
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  const handleDateSelect = (date: Date | null, disabled: boolean) => {
    if (!date || disabled) return;
    setSelectedDate(date);
    setSelectedSlotId('');
  };

  const canContinue = selectedDate && selectedSlotId && selectedDate.getDay() !== 0;

  // ✅ 关键修正：直接在本页选择时段后跳转到详情页，不再跳转到 select-slot
  const handleContinue = () => {
    if (!canContinue) return;
    router.push(
      `/booking/details?service=${encodeURIComponent(service)}&date=${format(selectedDate!, 'yyyy-MM-dd')}&time=${encodeURIComponent(selectedSlotId)}`
    );
  };

  return (
    <div className="space-y-6 py-4 max-w-md mx-auto px-4">
      <button
        onClick={() => router.push('/booking')}
        className="flex items-center text-gray-600 hover:text-blue-700 text-sm"
      >
        <ChevronLeft size={16} className="mr-1" />
        Back to Service Selection
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Select Date & Time</h1>
        <p className="text-gray-600 mt-1">Step 2 — Pick from the calendar</p>
      </div>

      {/* 📅 日历 */}
      <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="font-semibold text-lg">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleDateSelect(item.date, item.isDisabled)}
              disabled={item.isDisabled}
              className={`aspect-square rounded-lg text-sm transition-all ${
                !item.date ? '' :
                selectedDate && isSameDay(item.date, selectedDate)
                  ? 'bg-blue-600 text-white font-semibold shadow-md'
                  : item.isDisabled
                    ? 'text-gray-200 cursor-not-allowed'
                    : item.isSunday
                      ? 'hover:bg-amber-50 text-amber-700'
                      : 'hover:bg-blue-50 text-gray-700'
              }`}
            >
              {item.date ? format(item.date, 'd') : ''}
            </button>
          ))}
        </div>
      </div>

      {/* 已选日期 */}
      {selectedDate && (
        <div className={`p-3 rounded-lg flex items-center gap-3 ${
          selectedDate.getDay() === 0 ? 'bg-amber-50' : 'bg-blue-50'
        }`}>
          <CalendarIcon size={18} className={selectedDate.getDay() === 0 ? 'text-amber-600' : 'text-blue-600'} />
          <span className="font-medium text-sm">
            Selected: {format(selectedDate, 'EEEE d MMMM yyyy')}
          </span>
          <button
            onClick={() => { setSelectedDate(null); setSelectedSlotId(''); }}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >×</button>
        </div>
      )}

      {/* ⏰ 时段选择 */}
      <div>
        <label className="flex items-center font-semibold mb-3 text-gray-900">
          <Clock size={18} className="mr-2 text-blue-600" />
          Select Time Slot
        </label>

        {!selectedDate ? (
          <p className="text-sm text-gray-400 py-2">Please select a date first</p>
        ) : selectedDate.getDay() === 0 ? (
          <div className="bg-amber-50 p-4 rounded-lg text-center">
            <p className="text-amber-700 font-medium">Sunday — By Appointment Only</p>
            <p className="text-xs text-amber-600 mt-1">Please contact us directly to book</p>
          </div>
        ) : (
          <div className="space-y-2">
            {availableSlots.map(slot => (
              <button
                key={slot.id}
                onClick={() => setSelectedSlotId(slot.id)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedSlotId === slot.id
                    ? 'border-blue-600 bg-blue-50 font-medium text-blue-900'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleContinue}
        disabled={!canContinue}
        className="w-full bg-blue-700 text-white py-3.5 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-800 transition-colors"
      >
        Continue to Details →
      </button>

      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-sm text-gray-700 mb-2">Opening Hours</h3>
        <ul className="text-xs text-gray-500 space-y-1">
          <li className="flex justify-between"><span>Monday – Friday</span><span>08:00 – 18:00</span></li>
          <li className="flex justify-between"><span>Saturday</span><span>08:00 – 13:00</span></li>
          <li className="flex justify-between"><span>Sunday</span><span>By Appointment Only</span></li>
        </ul>
      </div>
    </div>
  );
}