// A fixed "now" for tests that read the fixtures' rolling week (0530, 0559).
// Sessions are worked out from the clock, so a label like "Lør 10:00" read
// "I morgen 10:00" on Fridays and "I dag 10:00" on Saturdays. Tests that
// assert such a label run at noon on the coming Wednesday (today, if it is
// one), still inside the fixtures' week. Pair with `jest.useRealTimers()`
// in an afterEach.
export function comingWednesdayNoon(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ((3 - d.getDay() + 7) % 7));
  d.setHours(12, 0, 0, 0);
  return d;
}
