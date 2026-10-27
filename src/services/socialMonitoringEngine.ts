import { SOCIAL_KEYWORDS } from '../config/socialKeywords.ts';
import { SOCIAL_SERVICE_AREA } from '../config/socialServiceArea.ts';

export type AreaStatus = 'IN_AREA' | 'NEEDS_REVIEW' | 'OUTSIDE_AREA';
export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'SAFETY';

export interface SocialLeadRecord {
  id: string;
  sourceType: string;
  groupName: string;
  postUrl?: string | null;
  postText: string;
  locationText?: string | null;
  serviceCategory: string;
  areaStatus: AreaStatus;
  urgency: UrgencyLevel;
  safetyFlag?: string | null;
  leadScore: number;
  recommendedAction: string;
  replyDraft?: string | null;
  status: string;
  operatorNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function normaliseText(value?: string | null): string {
  return (value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function detectSafetyFlag(postText: string): string | null {
  const text = normaliseText(postText);
  for (const [flag, keywords] of Object.entries(SOCIAL_KEYWORDS.safety_keywords)) {
    for (const kw of keywords) {
      if (text.includes(normaliseText(kw))) {
        return flag;
      }
    }
  }
  return null;
}

export function extractLocationFromPost(postText: string): string | null {
  const text = normaliseText(postText);

  // Check approved localities (case-insensitive words)
  for (const loc of SOCIAL_SERVICE_AREA.approved_localities) {
    const pattern = new RegExp(`\\b${loc}\\b`, 'i');
    if (pattern.test(text)) {
      return loc.charAt(0).toUpperCase() + loc.slice(1);
    }
  }

  // Check UK postcodes outwards e.g. WA1, L1, CH4
  for (const outward of SOCIAL_SERVICE_AREA.approved_postcode_outwards) {
    const pattern = new RegExp(`\\b${outward}\\b`, 'i');
    if (pattern.test(text)) {
      return outward.toUpperCase();
    }
  }

  return null;
}

export function resolveArea(
  locationInput?: string | null,
  postText?: string
): { areaStatus: AreaStatus; detectedLocation: string | null } {
  let loc = normaliseText(locationInput);

  if (!loc && postText) {
    const extracted = extractLocationFromPost(postText);
    if (extracted) {
      return { areaStatus: 'IN_AREA', detectedLocation: extracted };
    }
  }

  if (!loc) {
    return { areaStatus: 'NEEDS_REVIEW', detectedLocation: null };
  }

  // Check explicitly disallowed regions
  for (const dis of SOCIAL_SERVICE_AREA.disallowed_regions) {
    if (new RegExp(`\\b${dis}\\b`, 'i').test(loc)) {
      return { areaStatus: 'OUTSIDE_AREA', detectedLocation: locationInput || null };
    }
  }

  // Check approved localities
  for (const locality of SOCIAL_SERVICE_AREA.approved_localities) {
    if (new RegExp(`\\b${locality}\\b`, 'i').test(loc)) {
      return {
        areaStatus: 'IN_AREA',
        detectedLocation: locality.charAt(0).toUpperCase() + locality.slice(1),
      };
    }
  }

  // Check standard postcodes e.g. WA1 2AB, L1 8JQ
  const match = loc.toUpperCase().match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)/);
  if (match) {
    const outward = match[1];
    if (SOCIAL_SERVICE_AREA.approved_postcode_outwards.includes(outward)) {
      return { areaStatus: 'IN_AREA', detectedLocation: outward };
    }
    const prefix = outward.replace(/\d+.*$/, '');
    if (
      SOCIAL_SERVICE_AREA.approved_postcode_prefixes.includes(prefix) &&
      prefix !== 'M'
    ) {
      return { areaStatus: 'IN_AREA', detectedLocation: outward };
    }
    return { areaStatus: 'OUTSIDE_AREA', detectedLocation: outward };
  }

  return { areaStatus: 'NEEDS_REVIEW', detectedLocation: locationInput || null };
}

export function classifyService(postText: string): string {
  const text = normaliseText(postText);
  const categoryScores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(
    SOCIAL_KEYWORDS.service_categories
  )) {
    let matches = 0;
    for (const kw of keywords) {
      if (text.includes(normaliseText(kw))) {
        matches++;
      }
    }
    if (matches > 0) {
      categoryScores[category] = matches;
    }
  }

  if (Object.keys(categoryScores).length === 0) {
    return 'general_plumbing';
  }

  // Return category with highest matches
  return Object.keys(categoryScores).reduce((a, b) =>
    categoryScores[a] >= categoryScores[b] ? a : b
  );
}

export function calculateUrgency(postText: string): UrgencyLevel {
  const text = normaliseText(postText);
  for (const kw of SOCIAL_KEYWORDS.high_urgency_keywords) {
    if (text.includes(normaliseText(kw))) {
      return 'HIGH';
    }
  }
  return 'MEDIUM';
}

export function scoreLead(
  postText: string,
  serviceCategory: string,
  areaStatus: AreaStatus,
  urgency: UrgencyLevel,
  safetyFlag?: string | null
): { score: number; action: string } {
  if (safetyFlag) {
    return {
      score: 100,
      action: 'SAFETY_REVIEW_REQUIRED: DO NOT SEND COMMERCIAL REPLY',
    };
  }

  if (areaStatus === 'OUTSIDE_AREA') {
    return { score: 10, action: 'DO_NOT_REPLY: OUTSIDE SERVICE AREA' };
  }

  let score = 40;
  const text = normaliseText(postText);

  // Intent bonus
  for (const kw of SOCIAL_KEYWORDS.intent_keywords) {
    if (text.includes(normaliseText(kw))) {
      score += 15;
      break;
    }
  }

  // Area score
  if (areaStatus === 'IN_AREA') {
    score += 25;
  } else {
    score += 5;
  }

  // Urgency score
  if (urgency === 'HIGH') {
    score += 15;
  } else {
    score += 5;
  }

  score = Math.min(100, Math.max(0, score));

  let action = 'MONITOR_OR_REVIEW';
  if (score >= 75 && areaStatus === 'IN_AREA') {
    action = 'HIGH_PRIORITY_REPLY';
  } else if (score >= 60 && areaStatus === 'IN_AREA') {
    action = 'STANDARD_REPLY';
  }

  return { score, action };
}

export function generateReply(
  serviceCategory: string,
  areaStatus: AreaStatus,
  safetyFlag?: string | null,
  location?: string | null,
  postText?: string | null
): string | null {
  if (safetyFlag) return null;
  if (areaStatus !== 'IN_AREA') return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const locPhrase = location
    ? ` covering ${location}`
    : ' across North West England';
  const postLower = (postText || '').toLowerCase();

  let issueIntro = '';
  if (postLower.includes('tap') && (postLower.includes('leak') || postLower.includes('drip'))) {
    issueIntro = 'We can definitely help with your leaking tap repair.';
  } else if (postLower.includes('tap')) {
    issueIntro = 'We can definitely help with your tap or sink repair.';
  } else if (postLower.includes('bath') || postLower.includes('batten') || postLower.includes('shower bath')) {
    issueIntro = 'Our experienced plumbers can attend to adjust, support and properly fit your bath & shower installation.';
  } else if (postLower.includes('toilet') || postLower.includes('flush')) {
    issueIntro = 'We can help get your toilet plumbing inspected and sorted.';
  } else if (
    postLower.includes('boiler') ||
    postLower.includes('no heat') ||
    postLower.includes('radiator')
  ) {
    issueIntro =
      'Our Gas Safe registered engineers can attend to inspect and diagnose your heating/boiler issue.';
  } else if (postLower.includes('leak') || postLower.includes('burst')) {
    issueIntro = 'We can attend to isolate and repair that leak quickly.';
  } else {
    const serviceIntros: Record<string, string> = {
      tap_sink: 'We can definitely help with your tap or sink repair.',
      leak_repair: 'We can attend to isolate and repair that leak quickly.',
      boiler_heating:
        'Our Gas Safe registered engineers can attend to inspect and diagnose your heating/boiler issue.',
      toilet_bathroom: 'We can help get your bathroom plumbing sorted.',
      installation:
        'We would be glad to discuss your installation project and give you an upfront estimate.',
      general_plumbing: 'We can help sort your plumbing issue.',
    };
    issueIntro = serviceIntros[serviceCategory] || 'We can help sort your plumbing issue.';
  }

  return (
    `Hi there, we're Surefire Plumbing & Heating, locally based with 20+ years of professional experience${locPhrase}. ` +
    `${issueIntro} ` +
    `Feel free to drop us a direct message with your postcode or call us, and we can check engineer availability for you. ` +
    `You can also check our live appointment slots and upfront estimates online at ${appUrl}/booking. ` +
    `Hope you get it sorted! Cheers, Surefire Team`
  );
}

export function triagePost(payload: {
  id?: string;
  sourceType?: string;
  groupName?: string;
  postUrl?: string | null;
  postText: string;
  locationText?: string | null;
  operatorNotes?: string | null;
}): SocialLeadRecord {
  const safety = detectSafetyFlag(payload.postText);
  const { areaStatus, detectedLocation } = resolveArea(
    payload.locationText,
    payload.postText
  );
  const effectiveLocation =
    payload.locationText || detectedLocation || undefined;
  const serviceCat = classifyService(payload.postText);
  const urgency = safety ? 'SAFETY' : calculateUrgency(payload.postText);
  const { score, action } = scoreLead(
    payload.postText,
    serviceCat,
    areaStatus,
    urgency,
    safety
  );

  let status = 'NEW';
  if (safety) {
    status = 'SAFETY_REVIEW_REQUIRED';
  } else if (areaStatus === 'OUTSIDE_AREA') {
    status = 'OUTSIDE_SERVICE_AREA';
  }

  let replyDraft: string | null = null;
  if (areaStatus === 'IN_AREA' && !safety) {
    replyDraft = generateReply(
      serviceCat,
      areaStatus,
      safety,
      effectiveLocation,
      payload.postText
    );
  }

  const now = new Date().toISOString();
  return {
    id: payload.id || `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sourceType: payload.sourceType || 'GROUP_MANUAL',
    groupName: (payload.groupName || 'Facebook Group').trim(),
    postUrl: payload.postUrl || null,
    postText: payload.postText.trim(),
    locationText: effectiveLocation || null,
    serviceCategory: serviceCat,
    areaStatus,
    urgency,
    safetyFlag: safety,
    leadScore: score,
    recommendedAction: action,
    replyDraft,
    status,
    operatorNotes: payload.operatorNotes?.trim() || null,
    createdAt: now,
    updatedAt: now,
  };
}
