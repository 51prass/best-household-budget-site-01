// Hearth — money and date formatting. One job: present numbers consistently.

export function money(amount) {
  const n = Number(amount) || 0;
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function moneyShort(amount) {
  const n = Number(amount) || 0;
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function pct(rate) {
  return `${Math.round(rate * 100)}%`;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function monthLabel(month) {
  const [year, m] = month.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${year}`;
}

export function monthShort(month) {
  const [year, m] = month.split('-').map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${year}`;
}

export function dateLabel(iso) {
  const [year, m, d] = iso.split('-').map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}, ${year}`;
}

export function dayLabel(date) {
  const [year, m, d] = date.split('-').map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}`;
}

export function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
