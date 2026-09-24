/**
 * SUREFIRE — Pricing & Estimation Engine (Revised)
 * ✅ 拆分：上门费 + 工时/配件费 + 远程加价
 * ✅ 图片未上传时明确标注「无图参考」
 */

// 基础上门费（含10英里内往返）
const CALL_OUT_FEE = 40;

// 服务基准（不含路费，纯工时/技术费）
export const SERVICE_BASE_PRICE: Record<string, { min: number; max: number; unit: string }> = {
  plumbing: { min: 30, max: 95, unit: 'visit' },
  heating: { min: 55, max: 160, unit: 'visit' },
  emergency: { min: 85, max: 220, unit: 'hour' },
  maintenance: { min: 20, max: 75, unit: 'service' },
};

// 区域系数 — 远距离加价更明确
export const REGION_MULTIPLIER: Record<string, number> = {
  L: 1.0,      // 本地基准
  CH: 1.12,    // 稍远
  WA: 1.08,    // 邻近
  M: 1.20,     // 大曼彻斯特
  default: 1.25, // 其他地区统一上浮
};

// 远程附加费（超出服务范围/距离过远）
const getRemoteSurcharge = (prefix: string): number => {
  const surchargeMap: Record<string, number> = {
    CH: 10,
    WA: 5,
    M: 15,
    default: 25,
  };
  return surchargeMap[prefix] ?? surchargeMap.default;
};

// 复杂度关键词（同上，略）
export const COMPLEXITY_KEYWORDS: Record<string, number> = {
  leak: 1.1, leaking: 1.1, burst: 1.25,
  noheat: 1.15, cold: 1.1, 'no hot water': 1.15,
  noisy: 1.05, banging: 1.1, gurgling: 1.05,
  install: 1.2, replace: 1.15, fit: 1.1,
  repair: 1.0, fix: 1.0, check: 0.95,
  boiler: 1.2, radiator: 1.05, pipe: 1.0,
  blocked: 1.1, drain: 1.05,
  emergency: 1.3, urgent: 1.3, 'no water': 1.2,
};

export interface EstimateInput {
  serviceType: string;
  postcode: string;
  description: string;
  imageCount: number;
  timeSlot?: string;
  isEmergency?: boolean;
}

export interface EstimateResult {
  priceMin: number;
  priceMax: number;
  confidence: number;
  factors: string[];
  disclaimer: string;
  breakdown: {
    callOutFee: number;
    serviceMin: number;
    serviceMax: number;
    remoteSurcharge: number;
    hasPhotos: boolean;
  };
}

function extractPostcodePrefix(postcode: string): string {
  const cleaned = postcode.toUpperCase().replace(/\s+/g, '');
  const match = cleaned.match(/^([A-Z]{1,2})/);
  return match ? match[1] : 'default';
}

function calculateComplexity(description: string): number {
  const text = description.toLowerCase();
  let multiplier = 1.0;
  Object.entries(COMPLEXITY_KEYWORDS).forEach(([keyword, value]) => {
    if (text.includes(keyword)) multiplier = Math.max(multiplier, value);
  });
  return Math.min(multiplier, 1.4);
}

export function generateEstimate(input: EstimateInput): EstimateResult {
  const { serviceType, postcode, description, imageCount, timeSlot, isEmergency } = input;

  const base = SERVICE_BASE_PRICE[serviceType] || { min: 35, max: 90 };
  const prefix = extractPostcodePrefix(postcode);
  const regionMultiplier = REGION_MULTIPLIER[prefix] || REGION_MULTIPLIER.default;
  const remoteSurcharge = getRemoteSurcharge(prefix);
  const complexityMultiplier = calculateComplexity(description);

  // 时段溢价
  let timeMultiplier = 1.0;
  if (timeSlot?.includes('Evening')) timeMultiplier = 1.1;
  if (isEmergency) timeMultiplier = 1.3;

  // 图片影响置信度，不影响基础价格
  const hasPhotos = imageCount > 0;
  const photoConfidenceBoost = hasPhotos ? 15 : 0;

  // 最终价格 = 上门费 + 服务费 × 区域系数 × 复杂度 × 时段溢价
  const serviceMin = Math.round(base.min * regionMultiplier * complexityMultiplier * timeMultiplier);
  const serviceMax = Math.round(base.max * regionMultiplier * complexityMultiplier * timeMultiplier);

  const totalMin = CALL_OUT_FEE + serviceMin + remoteSurcharge;
  const totalMax = CALL_OUT_FEE + serviceMax + remoteSurcharge;

  const confidence = Math.round(
    55 + photoConfidenceBoost + (description.length > 30 ? 10 : 0)
  );

  const factors: string[] = [
    `Call-out fee: £${CALL_OUT_FEE} (within 10 miles)`,
    `Service: £${base.min}–£${base.max} base`,
    `Region: ×${regionMultiplier.toFixed(2)}`,
  ];
  if (remoteSurcharge > 0) factors.push(`Remote area surcharge: +£${remoteSurcharge}`);
  if (complexityMultiplier > 1.05) factors.push('Complex issue detected');
  if (hasPhotos) factors.push(`${imageCount} photo(s) provided → higher accuracy`);
  else factors.push('⚠️ No photos provided — estimate less accurate');
  if (timeMultiplier > 1.0) factors.push('Premium time slot selected');

  return {
    priceMin: totalMin,
    priceMax: totalMax,
    confidence,
    factors,
    disclaimer: hasPhotos
      ? 'This is an estimate. Final price confirmed on-site after inspection.'
      : 'Preliminary estimate only — upload photos for a more accurate quote. Final price confirmed on-site.',
    breakdown: {
      callOutFee: CALL_OUT_FEE,
      serviceMin: base.min,
      serviceMax: base.max,
      remoteSurcharge,
      hasPhotos,
    },
  };
}