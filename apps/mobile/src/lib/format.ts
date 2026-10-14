const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const formatMoney = (cents: number) => currency.format(cents / 100);

export const formatDate = (
  iso: string,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' },
) => new Date(iso).toLocaleDateString('en-US', options);

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

export const formatWeekday = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { weekday: 'long' });

export function formatDayLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86_400_000);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatRelative(iso: string): string {
  const seconds = Math.round((Date.now() - Date.parse(iso)) / 1000);
  if (seconds < 60) return 'just now';
  const units: [number, string][] = [
    [60, 'minute'],
    [24, 'hour'],
    [7, 'day'],
    [4.35, 'week'],
    [12, 'month'],
    [Number.POSITIVE_INFINITY, 'year'],
  ];
  let value = seconds / 60;
  for (const [step, unit] of units) {
    if (value < step) {
      const n = Math.floor(value);
      return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
    }
    value /= step;
  }
  return formatDate(iso);
}

/** "a" or "an" for the given word, e.g. an infectious disease specialist. */
export const article = (word: string) => (/^[aeiou]/i.test(word) ? 'an' : 'a');

export const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');

export const firstName = (name: string) => name.replace(/^Dr\.?\s+/i, '').split(/\s+/)[0] ?? name;

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function ageFrom(dateOfBirth?: string): number | undefined {
  if (!dateOfBirth) return undefined;
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  if (now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate())) age--;
  return age;
}

export function bmi(heightCm?: number, weightKg?: number): number | undefined {
  if (!heightCm || !weightKg) return undefined;
  return Math.round((weightKg / (heightCm / 100) ** 2) * 10) / 10;
}

/** Groups items by local calendar day, preserving order. */
export function groupByDay<T>(
  items: T[],
  getIso: (item: T) => string,
): { day: string; items: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = new Date(getIso(item)).toDateString();
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return [...groups.entries()].map(([day, list]) => ({ day, items: list }));
}
