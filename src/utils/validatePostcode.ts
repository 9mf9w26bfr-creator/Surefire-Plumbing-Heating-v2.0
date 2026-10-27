/**
 * UK Postcode Format Validator
 */

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;

export function isValidUKPostcode(postcode: string): boolean {
  if (!postcode) return false;
  return UK_POSTCODE_REGEX.test(postcode.trim());
}

export function formatUKPostcode(postcode: string): string {
  const cleaned = postcode.toUpperCase().replace(/\s+/g, '').trim();
  if (cleaned.length < 5) return cleaned;
  return `${cleaned.slice(0, cleaned.length - 3)} ${cleaned.slice(-3)}`;
}
