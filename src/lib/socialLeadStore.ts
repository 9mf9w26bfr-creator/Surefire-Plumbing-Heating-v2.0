import path from 'path';
import fs from 'fs/promises';
import { prisma } from './prisma';
import { SocialLeadRecord } from '@/services/socialMonitoringEngine';

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_FILE = path.join(DATA_DIR, 'social_leads.json');

async function getLocalLeads(): Promise<SocialLeadRecord[]> {
  try {
    const raw = await fs.readFile(BACKUP_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveLocalLeads(list: SocialLeadRecord[]): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(BACKUP_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Social Leads Local Save Error]', err);
  }
}

export async function fetchSocialLeads(
  statusFilter?: string | null,
  limit: number = 100
): Promise<SocialLeadRecord[]> {
  try {
    const where: any = {};
    if (statusFilter) {
      where.status = statusFilter;
    }
    const dbLeads = await (prisma as any).socialLead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    if (dbLeads && dbLeads.length > 0) {
      return dbLeads.map((item: any) => ({
        id: item.id,
        sourceType: item.sourceType,
        groupName: item.groupName,
        postUrl: item.postUrl,
        postText: item.postText,
        locationText: item.locationText,
        serviceCategory: item.serviceCategory,
        areaStatus: item.areaStatus,
        urgency: item.urgency,
        safetyFlag: item.safetyFlag,
        leadScore: item.leadScore,
        recommendedAction: item.recommendedAction,
        replyDraft: item.replyDraft,
        status: item.status,
        operatorNotes: item.operatorNotes,
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
        updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : String(item.updatedAt),
      }));
    }
  } catch (e) {
    // Fallback to local file store
  }

  let list = await getLocalLeads();
  if (statusFilter) {
    list = list.filter((l) => l.status === statusFilter);
  }
  return list.slice(0, limit);
}

export async function findSocialLeadById(id: string): Promise<SocialLeadRecord | null> {
  try {
    const item = await (prisma as any).socialLead.findUnique({
      where: { id },
    });
    if (item) {
      return {
        id: item.id,
        sourceType: item.sourceType,
        groupName: item.groupName,
        postUrl: item.postUrl,
        postText: item.postText,
        locationText: item.locationText,
        serviceCategory: item.serviceCategory,
        areaStatus: item.areaStatus,
        urgency: item.urgency,
        safetyFlag: item.safetyFlag,
        leadScore: item.leadScore,
        recommendedAction: item.recommendedAction,
        replyDraft: item.replyDraft,
        status: item.status,
        operatorNotes: item.operatorNotes,
        createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : String(item.createdAt),
        updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : String(item.updatedAt),
      };
    }
  } catch {}

  const list = await getLocalLeads();
  return list.find((l) => l.id === id) || null;
}

export async function insertSocialLead(lead: SocialLeadRecord): Promise<SocialLeadRecord> {
  try {
    await (prisma as any).socialLead.create({
      data: {
        id: lead.id,
        sourceType: lead.sourceType,
        groupName: lead.groupName,
        postUrl: lead.postUrl,
        postText: lead.postText,
        locationText: lead.locationText,
        serviceCategory: lead.serviceCategory,
        areaStatus: lead.areaStatus,
        urgency: lead.urgency,
        safetyFlag: lead.safetyFlag,
        leadScore: lead.leadScore,
        recommendedAction: lead.recommendedAction,
        replyDraft: lead.replyDraft,
        status: lead.status,
        operatorNotes: lead.operatorNotes,
      },
    });
  } catch {}

  const list = await getLocalLeads();
  const existingIdx = list.findIndex((l) => l.id === lead.id);
  if (existingIdx >= 0) {
    list[existingIdx] = lead;
  } else {
    list.unshift(lead);
  }
  await saveLocalLeads(list);
  return lead;
}

export async function patchSocialLead(
  id: string,
  updates: Partial<SocialLeadRecord>
): Promise<SocialLeadRecord | null> {
  const now = new Date().toISOString();
  try {
    await (prisma as any).socialLead.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
  } catch {}

  const list = await getLocalLeads();
  const item = list.find((l) => l.id === id);
  if (!item) return null;

  Object.assign(item, updates, { updatedAt: now });
  await saveLocalLeads(list);
  return item;
}

export async function removeSocialLead(id: string): Promise<boolean> {
  try {
    await (prisma as any).socialLead.delete({
      where: { id },
    });
  } catch {}

  const list = await getLocalLeads();
  const filtered = list.filter((l) => l.id !== id);
  await saveLocalLeads(filtered);
  return true;
}
