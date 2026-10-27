import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data');
const TRADERS_FILE = path.join(DATA_DIR, 'traders.json');

async function getLocalTraders(): Promise<any[]> {
  try {
    const raw = await fs.readFile(TRADERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveLocalTraders(list: any[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(TRADERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {}
}

export async function GET() {
  try {
    try {
      const dbTraders = await prisma.trader.findMany({
        orderBy: { appliedAt: 'desc' },
      });
      if (dbTraders && dbTraders.length > 0) {
        return NextResponse.json({ success: true, traders: dbTraders });
      }
    } catch {}

    const traders = await getLocalTraders();
    return NextResponse.json({ success: true, traders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve traders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessName,
      contactName,
      tradeType,
      email,
      phone,
      postcode,
      serviceAreaNote,
      experienceYears,
      qualifications = [],
      insuranceRef,
    } = body;

    if (!contactName || !email || !phone || !postcode) {
      return NextResponse.json(
        { error: 'Contact name, email, phone, and postcode are required' },
        { status: 400 }
      );
    }

    const traderRecord = {
      id: `trd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      businessName: businessName || contactName,
      contactName,
      tradeType: tradeType || 'Plumbing & Heating',
      email: email.toLowerCase().trim(),
      phone,
      postcode: postcode.toUpperCase().trim(),
      serviceAreaNote: serviceAreaNote || '',
      experienceYears: Number(experienceYears) || 0,
      qualifications: Array.isArray(qualifications) ? qualifications : [],
      insuranceRef: insuranceRef || '',
      portfolioUrls: [],
      status: 'APPLICATION_SUBMITTED',
      appliedAt: new Date().toISOString(),
      active: false,
    };

    // Try Prisma DB
    try {
      await prisma.trader.create({
        data: {
          businessName: traderRecord.businessName,
          contactName: traderRecord.contactName,
          tradeType: traderRecord.tradeType,
          email: traderRecord.email,
          phone: traderRecord.phone,
          postcode: traderRecord.postcode,
          serviceAreaNote: traderRecord.serviceAreaNote,
          experienceYears: traderRecord.experienceYears,
          qualifications: traderRecord.qualifications,
          insuranceRef: traderRecord.insuranceRef,
          portfolioUrls: [],
          status: 'APPLICATION_SUBMITTED',
        },
      });
    } catch {}

    const list = await getLocalTraders();
    list.unshift(traderRecord);
    await saveLocalTraders(list);

    return NextResponse.json({ success: true, application: traderRecord });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
