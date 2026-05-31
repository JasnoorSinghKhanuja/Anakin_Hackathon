const INR_SYMBOLS = /₹|rs\.?|inr/gi;

export function parsePrice(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;

  const cleaned = String(value)
    .replace(INR_SYMBOLS, '')
    .replace(/,/g, '')
    .match(/-?\d+(\.\d+)?/);

  if (!cleaned) return null;
  const parsed = Number(cleaned[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseRating(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return clamp(value, 0, 5);
  const matched = String(value).match(/\d+(\.\d+)?/);
  return matched ? clamp(Number(matched[0]), 0, 5) : null;
}

export function parseInteger(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Math.round(value);
  const matched = String(value).replace(/,/g, '').match(/\d+/);
  return matched ? Number(matched[0]) : null;
}

export function inferCurrency(...values) {
  const text = values.filter(Boolean).join(' ').toLowerCase();
  if (text.includes('₹') || text.includes('inr') || text.includes('rs')) return 'INR';
  return 'INR';
}

export function normalizeAvailability(value) {
  const text = String(value || '').toLowerCase();
  if (!text) return 'null';
  if (text.includes('out') || text.includes('unavailable') || text.includes('sold')) return 'out of stock';
  if (text.includes('stock') || text.includes('available') || text.includes('delivery') || text.includes('today')) return 'in stock';
  return 'null';
}

export function pickFirst(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') ?? null;
}

export function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return [String(value)];
}

export function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return null;
  return Math.max(min, Math.min(max, value));
}

