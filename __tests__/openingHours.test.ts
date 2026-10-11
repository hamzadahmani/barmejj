import {describe, expect, it} from '@jest/globals';
import {isTimeWithinRange, openingHint} from '../src/helpers/functions';
describe('opening-hour filters', () => {
  // Heure de Tunis (UTC+1), indépendante du fuseau de la machine de test.
  const time = (hour: number, minute = 0) =>
    new Date(Date.UTC(2026, 8, 15, hour - 1, minute));
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
  it('uses Tunis time whatever the phone time zone', () => {
    // 9:30 à Tunis = 8:30 UTC : ouvert pour « 09:00 - 20:00 ».
    expect(isTimeWithinRange('09:00 - 20:00', time(9, 30))).toBe(true);
    expect(isTimeWithinRange('09:00 - 20:00', time(8, 30))).toBe(false);
    expect(isTimeWithinRange('9h00 – 20h00', time(10))).toBe(true);
  });
  it('tells when a closed place opens', () => {
    expect(openingHint('09:00 - 20:00', time(8))).toBe('Ouvre à 09:00');
    expect(openingHint('09:00 - 20:00', time(10))).toBeNull();
    expect(openingHint('Sur réservation', time(10))).toBeNull();
  });
});
