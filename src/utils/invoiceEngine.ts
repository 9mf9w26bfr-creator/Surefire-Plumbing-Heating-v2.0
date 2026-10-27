export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  referenceNumber: string;
  issueDate: string;
  dueDate: string;
  company: {
    name: string;
    trade: string;
    gasSafeNumber: string;
    address: string;
    phone: string;
    email: string;
    bankName: string;
    sortCode: string;
    accountNumber: string;
  };
  customer: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    postcode: string;
  };
  serviceDetails: {
    serviceName: string;
    date: string;
    time: string;
    notes?: string;
  };
  items: InvoiceLineItem[];
  callOutFee: number;
  remoteSurcharge: number;
  subtotal: number;
  vatRate: number; // e.g. 0 or 20
  vatAmount: number;
  totalDue: number;
  paymentStatus: 'UNPAID' | 'PAID' | 'OVERDUE';
}

export function generateInvoiceNumber(referenceNumber?: string): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  if (referenceNumber) {
    const parts = referenceNumber.split('-');
    const core = parts[parts.length - 1] || `${randomSuffix}`;
    return `INV-${year}-${core}`;
  }
  return `INV-${year}-${randomSuffix}`;
}

export function buildDefaultInvoice(booking: {
  id: string;
  referenceNumber?: string;
  service: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  postcode: string;
  notes?: string;
  priceEstLo?: number;
  priceEstHi?: number;
}): InvoiceData {
  const invNumber = generateInvoiceNumber(booking.referenceNumber || booking.id);
  const today = new Date();
  const dueDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Determine standard base fees
  const callOutFee = 40; // Fixed £40 standard call-out fee
  const upperPostcode = (booking.postcode || '').toUpperCase().trim();
  let remoteSurcharge = 0;
  if (upperPostcode.startsWith('CH')) remoteSurcharge = 10;
  else if (upperPostcode.startsWith('M')) remoteSurcharge = 15;
  else if (upperPostcode.startsWith('WA')) remoteSurcharge = 5;

  const estMid = booking.priceEstLo
    ? Math.round(((booking.priceEstLo || 60) + (booking.priceEstHi || 90)) / 2)
    : 75;
  const initialLabor = Math.max(25, estMid - callOutFee - remoteSurcharge);

  const items: InvoiceLineItem[] = [
    {
      id: 'item-callout',
      description: 'Standard Call-Out & On-Site Assessment (Liverpool & North West England)',
      quantity: 1,
      unitPrice: callOutFee,
      total: callOutFee,
    },
    {
      id: 'item-labor',
      description: `Labor & Diagnostic Service: ${booking.service.replace(/-/g, ' ')}`,
      quantity: 1,
      unitPrice: initialLabor,
      total: initialLabor,
    },
  ];

  if (remoteSurcharge > 0) {
    items.push({
      id: 'item-surcharge',
      description: `Regional Coverage Travel Surcharge (${upperPostcode.slice(0, 3)})`,
      quantity: 1,
      unitPrice: remoteSurcharge,
      total: remoteSurcharge,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatRate = 0; // Standard UK small business domestic reverse charge / 0% VAT exemption
  const vatAmount = Math.round(((subtotal * vatRate) / 100) * 100) / 100;
  const totalDue = subtotal + vatAmount;

  return {
    invoiceNumber: invNumber,
    referenceNumber: booking.referenceNumber || booking.id,
    issueDate: today.toISOString().slice(0, 10),
    dueDate: dueDate.toISOString().slice(0, 10),
    company: {
      name: 'Surefire Plumbing & Heating Ltd',
      trade: 'Domestic Plumbing & Gas Safe Registered Heating Engineers',
      gasSafeNumber: '942104',
      address: 'Suite 4, Commercial Road, Liverpool, L5 9TY',
      phone: '0151 555 0192 / 07700 900142',
      email: 'billing@surefireplumbing.co.uk',
      bankName: 'Barclays Bank UK',
      sortCode: '20-51-08',
      accountNumber: '83920194',
    },
    customer: {
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      address: booking.address,
      postcode: booking.postcode,
    },
    serviceDetails: {
      serviceName: booking.service.replace(/-/g, ' '),
      date: booking.date,
      time: booking.time,
      notes: booking.notes,
    },
    items,
    callOutFee,
    remoteSurcharge,
    subtotal,
    vatRate,
    vatAmount,
    totalDue,
    paymentStatus: 'UNPAID',
  };
}
