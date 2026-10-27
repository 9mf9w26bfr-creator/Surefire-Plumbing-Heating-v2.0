import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Try Prisma DB first
    try {
      const b = await prisma.booking.findFirst({
        where: {
          OR: [{ id }, { referenceNumber: id }],
        },
        include: {
          customer: true,
          service: true,
          region: true,
        },
      });

      if (b) {
        return NextResponse.json({
          success: true,
          booking: {
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
          },
        });
      }
    } catch (err) {
      // Fallback
    }

    const list = await getLocalBookings();
    const item = list.find(b => b.id === id || b.referenceNumber === id);
    if (!item) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking: item });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const { status } = await req.json();
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Try Prisma DB
    try {
      await prisma.booking.updateMany({
        where: { OR: [{ id }, { referenceNumber: id }] },
        data: { status },
      });
    } catch {}

    // Update local list
    const list = await getLocalBookings();
    const updated = list.map(b => (b.id === id || b.referenceNumber === id) ? { ...b, status } : b);
    await saveLocalBookings(updated);

    return NextResponse.json({ success: true, status });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    try {
      await prisma.booking.deleteMany({
        where: { OR: [{ id }, { referenceNumber: id }] },
      });
    } catch {}

    const list = await getLocalBookings();
    const filtered = list.filter(b => b.id !== id && b.referenceNumber !== id);
    await saveLocalBookings(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}
