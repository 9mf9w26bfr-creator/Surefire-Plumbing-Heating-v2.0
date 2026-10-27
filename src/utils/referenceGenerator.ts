/**
 * SUREFIRE PLUMBING & HEATING — Reference Generator
 * Format: PH-NW-XXXXXX-XXXX
 */

export function generateBookingReference(): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let middle = '';
  for (let i = 0; i < 6; i++) {
    middle += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PH-NW-${middle}-${suffix}`;
}
