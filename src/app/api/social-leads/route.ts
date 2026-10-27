import { NextRequest, NextResponse } from 'next/server';
import { triagePost } from '@/services/socialMonitoringEngine';
import { fetchSocialLeads, insertSocialLead } from '@/lib/socialLeadStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 100;

    const leads = await fetchSocialLeads(status, limit);
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.postText || typeof body.postText !== 'string') {
      return NextResponse.json(
        { success: false, error: 'postText is required' },
        { status: 400 }
      );
    }

    const lead = triagePost({
      sourceType: body.sourceType || 'GROUP_MANUAL',
      groupName: body.groupName || 'Facebook Group',
      postUrl: body.postUrl || null,
      postText: body.postText,
      locationText: body.locationText || null,
      operatorNotes: body.operatorNotes || null,
    });

    const saved = await insertSocialLead(lead);
    return NextResponse.json({ success: true, lead: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
