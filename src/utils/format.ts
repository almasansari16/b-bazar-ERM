/** PKR currency formatting — "Rs. 12,999" */
export const formatPKR = (n: number) => `Rs. ${Math.round(n).toLocaleString('en-PK')}`;

/** Compact PKR — "Rs. 28.4M", "Rs. 1.28M", "Rs. 845K" */
export const formatPKRCompact = (n: number) => {
  if (n >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
  if (n >= 1_000) return `Rs. ${(n / 1_000).toFixed(0)}K`;
  return formatPKR(n);
};

export const formatNumber = (n: number) => Math.round(n).toLocaleString('en-PK');
export const formatCompact = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K` : String(n);

export const discountPct = (price: number, original: number) =>
  original > price ? Math.round(((original - price) / original) * 100) : 0;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${formatDate(iso)}, ${d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}`;
};
export const formatShortDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(iso);
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
export const deliveryWindow = (from: Date, minDays: number, maxDays: number) => {
  const a = addDays(from, minDays);
  const b = addDays(from, maxDays);
  return a.getMonth() === b.getMonth()
    ? `${a.getDate()}–${b.getDate()} ${MONTHS[b.getMonth()]}`
    : `${a.getDate()} ${MONTHS[a.getMonth()]} – ${b.getDate()} ${MONTHS[b.getMonth()]}`;
};
export const ymd = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

export const slugify = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
