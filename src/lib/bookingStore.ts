export interface BookingRecord {
  id: string;
  referenceNumber?: string;
  submittedAt: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  postcode: string;
  notes: string;
  photoUrls?: string[];
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

export function getAllBookings(): BookingRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLocalBooking(record: BookingRecord): void {
  if (typeof window === 'undefined') return;
  const all = getAllBookings().filter(b => b.id !== record.id);
  all.unshift(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// Save booking to server API with local fallback
export async function saveBookingAsync(
  record: Omit<BookingRecord, 'id' | 'submittedAt' | 'status'>
): Promise<BookingRecord> {
  const localId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const nowIso = new Date().toISOString();

  let resultRecord: BookingRecord = {
    ...record,
    id: localId,
    referenceNumber: `PH-NW-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    submittedAt: nowIso,
    status: 'pending',
  };

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.booking) {
        resultRecord = {
          ...resultRecord,
          id: data.booking.id,
          referenceNumber: data.booking.referenceNumber,
          submittedAt: data.booking.createdAt || nowIso,
        };
      }
    }
  } catch (err) {
    console.warn('[Booking Save API Network Error, cached locally]', err);
  }

  saveLocalBooking(resultRecord);
  return resultRecord;
}

// Synchronous legacy wrapper for existing pages
export function saveBooking(record: Omit<BookingRecord, 'id' | 'submittedAt' | 'status'>): BookingRecord {
  const localId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const newBooking: BookingRecord = {
    ...record,
    id: localId,
    referenceNumber: `PH-NW-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };

  saveLocalBooking(newBooking);

  // Trigger background server sync
  if (typeof window !== 'undefined') {
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    }).catch(err => console.warn('[Background sync error]', err));
  }

  return newBooking;
}

export async function fetchServerBookings(email?: string): Promise<BookingRecord[]> {
  try {
    const url = email ? `/api/bookings?email=${encodeURIComponent(email)}` : '/api/bookings';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.bookings)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.bookings));
        }
        return data.bookings;
      }
    }
  } catch {}
  return getAllBookings();
}

export function getBookingById(id: string): BookingRecord | null {
  return getAllBookings().find(b => b.id === id || b.referenceNumber === id) || null;
}

export function deleteBooking(id: string): void {
  const all = getAllBookings().filter(b => b.id !== id && b.referenceNumber !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    fetch(`/api/bookings/${id}`, { method: 'DELETE' }).catch(() => {});
  }
}
