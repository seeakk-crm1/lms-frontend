/**
 * Normalizes currency and amount inputs into a clean numeric float rounded to 2 decimal places.
 * Handles strings with currency symbols (₹, $), commas (5,00,000), whitespace, numbers, null, and undefined.
 *
 * Examples:
 * normalizeAmount("5,00,000") => 500000
 * normalizeAmount("500000.00") => 500000
 * normalizeAmount("₹5,00,000.50") => 500000.5
 * normalizeAmount(500000) => 500000
 * normalizeAmount("") => null
 * normalizeAmount(null) => null
 * normalizeAmount(undefined) => null
 */
export const normalizeAmount = (val: any): number | null => {
  if (val === null || val === undefined) return null;
  if (typeof val === 'number') {
    return Number.isFinite(val) ? Math.round(val * 100) / 100 : null;
  }
  const str = String(val).trim();
  if (!str) return null;
  const cleaned = str.replace(/[^0-9.-]/g, '');
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? Math.round(num * 100) / 100 : null;
};
