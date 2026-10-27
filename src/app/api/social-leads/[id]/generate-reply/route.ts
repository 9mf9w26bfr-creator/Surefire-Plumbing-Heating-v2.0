import { NextRequest, NextResponse } from 'next/server';
import { findSocialLeadById, patchSocialLead } from '@/lib/socialLeadStore';
import { generateReply } from '@/services/socialMonitoringEngine';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await findSocialLeadById(params.id);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    if (lead.safetyFlag) {
      return NextResponse.json({
        success: false,
        error: 'Safety signal detected. No promotional reply can be generated.',
        replyDraft: null,
      });
    }

    if (lead.areaStatus !== 'IN_AREA') {
      return NextResponse.json({
        success: false,
        error: 'Lead is outside the approved North West service area.',
        replyDraft: null,
      });
    }

    const draft = generateReply(
      lead.serviceCategory,
      lead.areaStatus,
      lead.safetyFlag,
      lead.locationText,
      lead.postText
    );

    const updated = await patchSocialLead(params.id, { replyDraft: draft });

    return NextResponse.json({
      success: true,
      lead: updated,
      replyDraft: draft,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
