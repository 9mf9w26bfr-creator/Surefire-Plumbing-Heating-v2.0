/**
 * Scheduling & Time Slot Allocation Engine
 */

export interface TimeSlotOption {
  id: string;
  label: string;
  startHour: number;
  endHour: number;
}

export function getAvailableSlotsForDate(date: Date): TimeSlotOption[] {
  const day = date.getDay();

  // Sunday = Closed for regular online slots (emergency / by appointment only)
  if (day === 0) return [];

  // Saturday = Morning only
  if (day === 6) {
    return [
      { id: 'saturday', label: 'Saturday Morning — 08:00–13:00', startHour: 8, endHour: 13 },
    ];
  }

  // Weekdays Mon-Fri
  return [
    { id: 'morning', label: 'Morning Slot — 08:00–12:00', startHour: 8, endHour: 12 },
    { id: 'afternoon', label: 'Afternoon Slot — 12:00–18:00', startHour: 12, endHour: 18 },
  ];
}
