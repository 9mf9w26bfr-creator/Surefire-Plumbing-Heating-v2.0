import { NextRequest, NextResponse } from 'next/server';
import { triagePost } from '@/services/socialMonitoringEngine';
import { insertSocialLead } from '@/lib/socialLeadStore';

export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.postText || typeof body.postText !== 'string') {
      return NextResponse.json(
        { success: false, error: 'postText is required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const lead = triagePost({
      sourceType: body.sourceType || 'BROWSER_BOOKMARKLET',
      groupName: body.groupName || 'Facebook Group',
      postUrl: body.postUrl || null,
      postText: body.postText,
      locationText: body.locationText || null,
      operatorNotes: body.operatorNotes || null,
    });

    const saved = await insertSocialLead(lead);

    return NextResponse.json(
      {
        success: true,
        message: 'Lead captured and analyzed successfully!',
        lead: saved,
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
