/**
 * SUREFIRE PLUMBING & HEATING — Geographic Coverage Engine
 * Constitution: Config-driven, no hard-coded city checks
 */

import { SERVICE_AREAS } from '@/config/serviceArea';

export enum CoverageResult {
  FULLY_COVERED = 'FULLY_COVERED',
  NOT_COVERED  = 'NOT_COVERED',
  DISABLED     = 'DISABLED',
}

function normalizePostcode(postcode: string): string {
  return postcode.toUpperCase().replace(/\s+/g, '').trim();
}

function matchesAllowedPatterns(
  normalized: string,
  patterns: string[]
): boolean {
  return patterns.some(prefix => normalized.startsWith(prefix));
}

export function checkPostcodeCoverage(postcode: string): CoverageResult {
  const normalized = normalizePostcode(postcode);

  for (const [key, config] of Object.entries(SERVICE_AREAS)) {
    const envKey = `${key.toUpperCase()}_ENABLED`;
    const isEnabled = process.env[envKey] === 'true';

    if (!isEnabled || config.status === 'inactive') continue;

    const prefixMatch = config.postcodePrefixes.some(prefix =>
      normalized.startsWith(prefix)
    );
    if (!prefixMatch) continue;

    if (
      key === 'greaterManchester' &&
      process.env.GREATER_MANCHESTER_MODE === 'SELECTED_POSTCODES' &&
      config.allowedPostcodes
    ) {
      return matchesAllowedPatterns(normalized, config.allowedPostcodes)
        ? CoverageResult.FULLY_COVERED
        : CoverageResult.NOT_COVERED;
    }

    return CoverageResult.FULLY_COVERED;
  }

  return CoverageResult.DISABLED;
}

export function isTraderRegionAllowed(postcode: string): boolean {
  if (process.env.TRADER_NETWORK_ENABLED !== 'true') return false;
  return checkPostcodeCoverage(postcode) === CoverageResult.FULLY_COVERED;
}