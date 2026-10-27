/**
 * SUREFIRE PLUMBING & HEATING — Geographic Coverage Engine
 * Constitution: Config-driven, no hard-coded city checks
 */

import { SERVICE_AREAS, type ServiceAreaConfig } from '../config/serviceArea.ts';

export const CoverageResult = {
  FULLY_COVERED: 'FULLY_COVERED',
  NOT_COVERED: 'NOT_COVERED',
  DISABLED: 'DISABLED',
} as const;

export type CoverageResult = (typeof CoverageResult)[keyof typeof CoverageResult];

export interface CoverageDetail {
  result: CoverageResult;
  isCovered: boolean;
  region?: string;
  message: string;
}

export function normalizePostcode(postcode: string): string {
  return postcode.toUpperCase().replace(/\s+/g, '').trim();
}

function matchesAllowedPatterns(
  normalized: string,
  patterns: string[]
): boolean {
  return patterns.some(prefix => normalized.startsWith(prefix.toUpperCase()));
}

export function checkPostcodeCoverage(postcode: string): CoverageResult {
  const detail = getCoverageDetail(postcode);
  return detail.result;
}

export function getCoverageDetail(postcode: string): CoverageDetail {
  const normalized = normalizePostcode(postcode);
  if (!normalized || normalized.length < 2) {
    return {
      result: CoverageResult.NOT_COVERED,
      isCovered: false,
      message: 'Please enter a valid UK postcode.',
    };
  }

  for (const [key, config] of Object.entries(SERVICE_AREAS)) {
    const envKey = `${key.toUpperCase()}_ENABLED`;
    const envValue = typeof process !== 'undefined' && process.env ? process.env[envKey] : undefined;
    const isExplicitlyDisabled = envValue === 'false';

    if (isExplicitlyDisabled || config.status === 'inactive') {
      continue;
    }

    const prefixMatch = config.postcodePrefixes.some(prefix =>
      normalized.startsWith(prefix.toUpperCase())
    );

    if (!prefixMatch) continue;

    if (key === 'greaterManchester') {
      const isSelectedOnly = (typeof process !== 'undefined' && process.env && process.env.GREATER_MANCHESTER_MODE)
        ? process.env.GREATER_MANCHESTER_MODE === 'SELECTED_POSTCODES'
        : true;

      if (isSelectedOnly && config.allowedPostcodes) {
        const covered = matchesAllowedPatterns(normalized, config.allowedPostcodes);
        return {
          result: covered ? CoverageResult.FULLY_COVERED : CoverageResult.NOT_COVERED,
          isCovered: covered,
          region: config.region,
          message: covered
            ? `Covered under ${config.region} (selected areas).`
            : `Postcode is within Greater Manchester, but outside currently active zones.`,
        };
      }
    }

    return {
      result: CoverageResult.FULLY_COVERED,
      isCovered: true,
      region: config.region,
      message: `Fully covered in our ${config.region} service zone.`,
    };
  }

  return {
    result: CoverageResult.NOT_COVERED,
    isCovered: false,
    message: 'Outside our current North West service area (Liverpool, Merseyside, Cheshire, Runcorn, Widnes, Warrington, St Helens, selected GM postcodes).',
  };
}

export function isTraderRegionAllowed(postcode: string): boolean {
  const envVal = typeof process !== 'undefined' && process.env ? process.env.TRADER_NETWORK_ENABLED : undefined;
  if (envVal === 'false') return false;
  return checkPostcodeCoverage(postcode) === CoverageResult.FULLY_COVERED;
}
