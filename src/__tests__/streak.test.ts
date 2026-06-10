import { describe, it, expect } from "vitest";

// Streak calculation logic (extracted from /api/metrics/weekly)
function calculateStreak(
  habits: { completed: boolean; date: Date }[],
  referenceDate: Date
): number {
  const dayMap = new Map<string, { total: number; completed: number }>();
  for (const h of habits) {
    const key = h.date.toISOString().slice(0, 10);
    const entry = dayMap.get(key) ?? { total: 0, completed: 0 };
    entry.total += 1;
    if (h.completed) entry.completed += 1;
    dayMap.set(key, entry);
  }

  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );

  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    const entry = dayMap.get(key);
    if (entry && entry.completed > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

describe("calculateStreak", () => {
  const today = new Date("2026-06-10T12:00:00Z");

  it("returns 0 when no habits exist", () => {
    expect(calculateStreak([], today)).toBe(0);
  });

  it("returns 1 when only today has completed habit", () => {
    const habits = [{ completed: true, date: new Date("2026-06-10") }];
    expect(calculateStreak(habits, today)).toBe(1);
  });

  it("returns consecutive streak ignoring gaps", () => {
    const habits = [
      { completed: true, date: new Date("2026-06-10") },
      { completed: true, date: new Date("2026-06-09") },
      { completed: true, date: new Date("2026-06-08") },
      // gap on 2026-06-07
      { completed: true, date: new Date("2026-06-06") },
    ];
    expect(calculateStreak(habits, today)).toBe(3);
  });

  it("breaks streak on day with only uncompleted habits", () => {
    const habits = [
      { completed: true, date: new Date("2026-06-10") },
      { completed: false, date: new Date("2026-06-09") },
      { completed: true, date: new Date("2026-06-08") },
    ];
    expect(calculateStreak(habits, today)).toBe(1);
  });

  it("counts streak even when day has mixed completed/uncompleted", () => {
    const habits = [
      { completed: true, date: new Date("2026-06-10") },
      { completed: false, date: new Date("2026-06-10") },
      { completed: true, date: new Date("2026-06-09") },
    ];
    expect(calculateStreak(habits, today)).toBe(2);
  });

  it("returns 0 when today has no completed habits despite history", () => {
    const habits = [
      { completed: false, date: new Date("2026-06-10") },
      { completed: true, date: new Date("2026-06-09") },
    ];
    expect(calculateStreak(habits, today)).toBe(0);
  });
});
