import { NextRequest, NextResponse } from 'next/server';
import { generateEstimate } from '@/config/pricing';
import { getCoverageDetail } from '@/utils/serviceAreaEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceType, postcode, description = '', imageCount = 0, timeSlot } = body;

    if (!serviceType || !postcode) {
      return NextResponse.json(
        { error: 'serviceType and postcode are required' },
        { status: 400 }
      );
    }

    const coverage = getCoverageDetail(postcode);
    const estimate = generateEstimate({
      serviceType,
      postcode,
      description,
      imageCount,
      timeSlot,
      isEmergency: serviceType === 'emergency-plumbing',
    });

    return NextResponse.json({
      success: true,
      coverage,
      estimate,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to calculate estimate' },
      { status: 500 }
    );
  }
}
