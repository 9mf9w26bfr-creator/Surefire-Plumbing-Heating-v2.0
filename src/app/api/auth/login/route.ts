import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationCodeEmail } from '@/lib/email';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data');
const CODES_FILE = path.join(DATA_DIR, 'pending_codes.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

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
  } catch {}
}

async function getLocalUsers(): Promise<any[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const users = await getLocalUsers();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);

    const userName = existing ? existing.name : 'Valued Customer';
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const codes = await getPendingCodes();
    codes[cleanEmail] = {
      email: cleanEmail,
      name: userName,
      code,
      expiresAt,
    };
    await savePendingCodes(codes);

    await sendVerificationCodeEmail(cleanEmail, userName, code);

    const isMock = !process.env.RESEND_API_KEY;

    return NextResponse.json({
      success: true,
      message: 'Sign-in code sent to your email address.',
      devCode: isMock ? code : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send login code' }, { status: 500 });
  }
}
