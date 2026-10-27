import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get('date');

  if (!dateStr) {
    return NextResponse.json({ error: 'Date parameter required' }, { status: 400 });
  }

  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();

  if (dayOfWeek === 0) {
    return NextResponse.json({
      date: dateStr,
      available: false,
      message: 'Sunday — By appointment only',
      slots: [],
    });
  }

  if (dayOfWeek === 6) {
    return NextResponse.json({
      date: dateStr,
      available: true,
      slots: [
        { id: 'saturday', label: 'Saturday Morning (08:00 – 13:00)', available: true },
      ],
    });
  }

  return NextResponse.json({
    date: dateStr,
    available: true,
    slots: [
      { id: 'morning', label: 'Morning (08:00 – 12:00)', available: true },
      { id: 'afternoon', label: 'Afternoon (12:00 – 18:00)', available: true },
    ],
  });
}
