import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

async function saveLocalUsers(list: any[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(USERS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const codes = await getPendingCodes();
    const pending = codes[cleanEmail];

    if (!pending) {
      return NextResponse.json({ error: 'No verification code requested for this email' }, { status: 400 });
    }

    if (new Date(pending.expiresAt) < new Date()) {
      delete codes[cleanEmail];
      await savePendingCodes(codes);
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    if (pending.code !== code.trim()) {
      return NextResponse.json({ error: 'Incorrect verification code. Please check your email and try again.' }, { status: 400 });
    }

    // Code matches! Clear pending code
    delete codes[cleanEmail];
    await savePendingCodes(codes);

    const userName = pending.name || 'Valued Customer';
    const nowIso = new Date().toISOString();

    // Upsert into DB if available
    try {
      await prisma.customer.upsert({
        where: { email: cleanEmail },
        update: { name: userName, emailVerified: new Date() },
        create: {
          email: cleanEmail,
          name: userName,
          addresses: [],
          emailVerified: new Date(),
        },
      });
    } catch (dbErr) {
      console.warn('[Prisma Customer Upsert Skipped]', (dbErr as Error).message);
    }

    // Update local users backup
    const users = await getLocalUsers();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        email: cleanEmail,
        name: userName,
        verified: true,
        registeredAt: nowIso,
      };
      users.push(user);
    } else {
      user.name = userName;
      user.verified = true;
    }
    await saveLocalUsers(users);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[Auth Verify Error]', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
