import { describe, expect, it } from 'vitest';
import { generateSlotWindows, overlaps } from '../src';

describe('generateSlotWindows', () => {
  it('splits a window into equal slots', () => {
    const slots = generateSlotWindows({
      date: '2026-01-05',
      startTime: '09:00',
      endTime: '11:00',
      durationMinutes: 30,
    });
    expect(slots).toHaveLength(4);
    expect(slots[0]).toEqual({
      start: '2026-01-05T09:00:00.000Z',
      end: '2026-01-05T09:30:00.000Z',
    });
  });

  it('applies the device timezone offset', () => {
    // UTC-7 (e.g. PDT) reports an offset of +420 minutes.
    const [first] = generateSlotWindows({
      date: '2026-07-01',
      startTime: '09:00',
      endTime: '09:30',
      timezoneOffsetMinutes: 420,
    });
    expect(first?.start).toBe('2026-07-01T16:00:00.000Z');
  });

  it('drops a trailing partial slot', () => {
    expect(
      generateSlotWindows({
        date: '2026-01-05',
        startTime: '09:00',
        endTime: '09:50',
        durationMinutes: 30,
      }),
    ).toHaveLength(1);
  });
});

describe('overlaps', () => {
  it('detects overlapping and adjacent windows', () => {
    const a = { start: '2026-01-05T09:00:00Z', end: '2026-01-05T09:30:00Z' };
    expect(overlaps(a, { start: '2026-01-05T09:15:00Z', end: '2026-01-05T09:45:00Z' })).toBe(true);
    expect(overlaps(a, { start: '2026-01-05T09:30:00Z', end: '2026-01-05T10:00:00Z' })).toBe(false);
  });
});
