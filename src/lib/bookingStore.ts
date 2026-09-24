export interface BookingRecord {
  id: string;
  submittedAt: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  address: string;
  postcode: string;
  notes: string;
  imageCount: number;
  estMin: number;
  estMax: number;
  callOutFee: number;
  serviceMin: number;
  serviceMax: number;
  remoteSurcharge: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

const STORAGE_KEY = 'surefire_bookings';

// 获取所有订单
export function getAllBookings(): BookingRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// 保存新订单
export function saveBooking(record: Omit<BookingRecord, 'id' | 'submittedAt' | 'status'>): BookingRecord {
  const newBooking: BookingRecord = {
    ...record,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };
  
  const all = getAllBookings();
  all.unshift(newBooking); // 最新的放最前面
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newBooking;
}

// 获取单个订单
export function getBookingById(id: string): BookingRecord | null {
  return getAllBookings().find(b => b.id === id) || null;
}

// 删除订单
export function deleteBooking(id: string): void {
  const all = getAllBookings().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}