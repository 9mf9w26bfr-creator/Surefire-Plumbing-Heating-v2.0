export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface BookingData {
  id: string;
  referenceNumber: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  address: string;
  postcode: string;
  notes?: string;
  photoUrls: string[];
  imageCount: number;
  priceEstLo: number;
  priceEstHi: number;
  callOutFee: number;
  serviceMin: number;
  serviceMax: number;
  remoteSurcharge: number;
  status: BookingStatus;
  createdAt: string;
}

export type CreateBookingInput = Omit<BookingData, 'id' | 'referenceNumber' | 'createdAt' | 'status'> & {
  status?: BookingStatus;
};
