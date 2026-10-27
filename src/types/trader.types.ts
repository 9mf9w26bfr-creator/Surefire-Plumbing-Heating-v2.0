export type TraderStatus =
  | 'APPLICATION_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'EXPIRED';

export interface TraderRecord {
  id: string;
  businessName: string;
  contactName: string;
  tradeType: string;
  email: string;
  phone: string;
  postcode: string;
  serviceAreaNote?: string;
  experienceYears?: number;
  qualifications: string[];
  insuranceRef?: string;
  portfolioUrls: string[];
  status: TraderStatus;
  appliedAt: string;
  active: boolean;
}
