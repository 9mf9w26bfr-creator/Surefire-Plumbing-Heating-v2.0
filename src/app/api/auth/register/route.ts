import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationCodeEmail } from '@/lib/email';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data');
const CODES_FILE = path.join(DATA_DIR, 'pending_codes.json');

async function getPendingCodes(): Promise<Record<string, any>> {
  try {
    const raw = await fs.readFile(CODES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function savePendingCodes(data: Record<string, any>): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CODES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Save Pending Codes Error]', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const codes = await getPendingCodes();
    codes[cleanEmail] = {
      email: cleanEmail,
      name: name?.trim() || 'Valued Customer',
      code,
      expiresAt,
    };
    await savePendingCodes(codes);

    // Send email via Resend or mock fallback
    await sendVerificationCodeEmail(cleanEmail, name, code);

    // In dev mode when Resend is not configured, also return the code for instant local testing
    const isMock = !process.env.RESEND_API_KEY;

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email address.',
      devCode: isMock ? code : undefined,
    });
  } catch (error) {
    console.error('[Auth Register Error]', error);
    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
  }
}
