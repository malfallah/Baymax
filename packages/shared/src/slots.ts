import type { CreateSlotsInput } from './schemas';

export interface SlotWindow {
  start: string;
  end: string;
}

/**
 * Splits a doctor's working window on a given local date into consecutive
 * appointment slots, returned as UTC ISO strings.
 */
export function generateSlotWindows(input: CreateSlotsInput): SlotWindow[] {
  const { date, startTime, endTime, durationMinutes = 30, timezoneOffsetMinutes = 0 } = input;
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const toUtc = (hhmm: string) => {
    const [h, min] = hhmm.split(':').map(Number) as [number, number];
    // getTimezoneOffset() semantics: UTC = local + offset.
    return Date.UTC(y, m - 1, d, h, min) + timezoneOffsetMinutes * 60_000;
  };

  const windows: SlotWindow[] = [];
  const stepMs = durationMinutes * 60_000;
  const end = toUtc(endTime);
  for (let t = toUtc(startTime); t + stepMs <= end; t += stepMs) {
    windows.push({ start: new Date(t).toISOString(), end: new Date(t + stepMs).toISOString() });
  }
  return windows;
}

export function overlaps(a: SlotWindow, b: SlotWindow): boolean {
  return Date.parse(a.start) < Date.parse(b.end) && Date.parse(b.start) < Date.parse(a.end);
}
