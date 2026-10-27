import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateBookingReference } from '@/utils/referenceGenerator';
import { getCoverageDetail } from '@/utils/serviceAreaEngine';
import { sendBookingConfirmationEmail } from '@/lib/email';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'bookings.json');

async function getLocalBookings(): Promise<any[]> {
  try {
    const raw = await fs.readFile(BACKUP_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveLocalBookings(list: any[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(BACKUP_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Local Backup Save Error]', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const reference = searchParams.get('reference');

    // Try Prisma DB first
    try {
      const where: any = {};
      if (email) {
        where.customer = { email };
      }
      if (reference) {
        where.referenceNumber = reference;
      }

      const bookings = await prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          service: true,
          region: true,
        },
      });

      if (bookings && bookings.length > 0) {
        return NextResponse.json({
          success: true,
          bookings: bookings.map(b => ({
            id: b.id,
            referenceNumber: b.referenceNumber,
            service: b.service?.name || 'Plumbing Service',
            serviceId: b.serviceId,
            date: b.scheduledDate.toISOString().slice(0, 10),
            time: `${b.startTime.toISOString().slice(11, 16)} - ${b.endTime.toISOString().slice(11, 16)}`,
            name: b.customer?.name || 'Customer',
            email: b.customer?.email || '',
            phone: b.customer?.phone || '',
            address: b.address,
            postcode: b.postcode,
            notes: b.problemDesc || '',
            photoUrls: b.photoUrls || [],
            imageCount: (b.photoUrls || []).length,
            priceEstLo: Number(b.priceEstLo || 0),
            priceEstHi: Number(b.priceEstHi || 0),
            callOutFee: 40,
            serviceMin: Number(b.priceEstLo || 0) > 40 ? Number(b.priceEstLo || 0) - 40 : 0,
            serviceMax: Number(b.priceEstHi || 0) > 40 ? Number(b.priceEstHi || 0) - 40 : 0,
            remoteSurcharge: 0,
            status: b.status,
            createdAt: b.createdAt.toISOString(),
          })),
        });
      }
    } catch (dbErr) {
      console.warn('[DB Query Falling Back to Local Store]', (dbErr as Error).message);
    }

    // Fallback to local storage file
    let list = await getLocalBookings();
    if (email) {
      list = list.filter(b => b.email?.toLowerCase() === email.toLowerCase());
    }
    if (reference) {
      list = list.filter(b => b.referenceNumber === reference || b.id === reference);
    }

    return NextResponse.json({
      success: true,
      bookings: list,
    });
  } catch (error) {
    console.error('[GET /api/bookings error]', error);
    return NextResponse.json({ error: 'Failed to retrieve bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      service,
      date,
      time,
      name,
      phone,
      email,
      address,
      postcode,
      notes,
      photoUrls = [],
      estMin = 0,
      estMax = 0,
      callOutFee = 40,
      serviceMin = 0,
      serviceMax = 0,
      remoteSurcharge = 0,
    } = body;

    if (!service || !date || !time || !name || !phone || !address || !postcode) {
      return NextResponse.json(
        { error: 'Missing required booking fields (service, date, time, name, phone, address, postcode)' },
        { status: 400 }
      );
    }

    const coverage = getCoverageDetail(postcode);
    if (!coverage.isCovered) {
      console.warn(`[Coverage Warning] Booking submitted for out-of-area postcode: ${postcode}`);
    }

    const referenceNumber = generateBookingReference();
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowIso = new Date().toISOString();

    const record = {
      id: bookingId,
      referenceNumber,
      service,
      date,
      time,
      name,
      phone,
      email: email || '',
      address,
      postcode: postcode.toUpperCase(),
      notes: notes || '',
      photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
      imageCount: Array.isArray(photoUrls) ? photoUrls.length : 0,
      priceEstLo: Number(estMin) || 0,
      priceEstHi: Number(estMax) || 0,
      callOutFee: Number(callOutFee) || 40,
      serviceMin: Number(serviceMin) || 0,
      serviceMax: Number(serviceMax) || 0,
      remoteSurcharge: Number(remoteSurcharge) || 0,
      status: 'pending',
      createdAt: nowIso,
      regionName: coverage.region || 'North West',
    };

    // Try saving to DB via Prisma
    let dbSaved = false;
    try {
      // Find or create customer
      const customerEmail = email?.trim() || `${phone.replace(/\s+/g, '')}@temporary.surefire.co.uk`;
      const customer = await prisma.customer.upsert({
        where: { email: customerEmail },
        update: { name, phone },
        create: {
          email: customerEmail,
          name,
          phone,
          addresses: [{ address, postcode }],
        },
      });

      // Find or create region
      const regionCode = coverage.region ? coverage.region.toUpperCase().replace(/\s+/g, '_') : 'NORTH_WEST';
      const region = await prisma.region.upsert({
        where: { code: regionCode },
        update: {},
        create: {
          code: regionCode,
          name: coverage.region || 'North West England',
          status: 'active',
          postcodePrefixes: [postcode.slice(0, 3).toUpperCase()],
          allowedPostcodes: [],
        },
      });

      // Find or create service
      let dbService = await prisma.service.findFirst({
        where: { name: { contains: service.replace(/-/g, ' '), mode: 'insensitive' } },
      });
      if (!dbService) {
        dbService = await prisma.service.create({
          data: {
            name: service.replace(/-/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase()),
            category: 'Plumbing',
            baseMin: Number(estMin) || 35,
            baseMax: Number(estMax) || 90,
          },
        });
      }

      // Parse schedule times
      const scheduledDate = new Date(`${date}T09:00:00Z`);
      const startTime = new Date(`${date}T08:00:00Z`);
      const endTime = new Date(`${date}T18:00:00Z`);

      await prisma.booking.create({
        data: {
          referenceNumber,
          isOurOwnService: true,
          customerId: customer.id,
          regionId: region.id,
          serviceId: dbService.id,
          status: 'pending',
          scheduledDate,
          startTime,
          endTime,
          address,
          postcode: postcode.toUpperCase(),
          problemDesc: notes || '',
          photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
          priceEstLo: Number(estMin) || null,
          priceEstHi: Number(estMax) || null,
        },
      });

      dbSaved = true;
    } catch (dbErr) {
      console.warn('[Prisma DB Save Skipped / Fallback to Local Backup]', (dbErr as Error).message);
    }

    // Always ensure local file backup is updated
    const localList = await getLocalBookings();
    localList.unshift(record);
    await saveLocalBookings(localList);

    // Send confirmation email
    if (email) {
      sendBookingConfirmationEmail({
        referenceNumber,
        service: service.replace(/-/g, ' '),
        date,
        time,
        name,
        email,
        phone,
        address,
        postcode,
        priceEstLo: Number(estMin),
        priceEstHi: Number(estMax),
      }).catch(err => console.error('[Email Notification Error]', err));
    }

    return NextResponse.json({
      success: true,
      booking: record,
      dbSaved,
    });
  } catch (error) {
    console.error('[POST /api/bookings error]', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
