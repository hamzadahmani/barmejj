import {describe, expect, it} from '@jest/globals';
import {isTimeWithinRange} from '../src/helpers/functions';
describe('opening-hour filters', () => {
  const time = (hour: number, minute = 0) =>
    new Date(2026, 8, 15, hour, minute);
  it('handles overnight opening hours and the closing boundary', () => {
    expect(isTimeWithinRange('18:00 - 02:00', time(23))).toBe(true);
    expect(isTimeWithinRange('18:00 - 02:00', time(1))).toBe(true);
    expect(isTimeWithinRange('18:00 - 02:00', time(2))).toBe(false);
    expect(isTimeWithinRange('18:00 - 02:00', time(12))).toBe(false);
  });
  it('does not crash or claim to be open for invalid hours', () => {
    expect(isTimeWithinRange('Sur réservation', time(12))).toBe(false);
    expect(isTimeWithinRange('99:00 - 25:00', time(12))).toBe(false);
    expect(isTimeWithinRange('09:00-18:00', time(12))).toBe(true);
  });
});
