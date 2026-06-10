import { describe, it } from "node:test";
import assert from "node:assert/strict";

function calculateStreak(habits, referenceDate) {
  const dayMap = new Map();
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

const today = new Date("2026-06-10T12:00:00Z");

describe("calculateStreak", () => {
  it("returns 0 when no habits exist", () => {
    assert.equal(calculateStreak([], today), 0);
  });

  it("returns 1 when only today has completed habit", () => {
    const habits = [{ completed: true, date: new Date("2026-06-10") }];
    assert.equal(calculateStreak(habits, today), 1);
  });

  it("returns consecutive streak stopping at gap", () => {
    const habits = [
      { completed: true, date: new Date("2026-06-10") },
      { completed: true, date: new Date("2026-06-09") },
      { completed: true, date: new Date("2026-06-08") },
      { completed: true, date: new Date("2026-06-06") }, // gap on 2026-06-07
    ];
    assert.equal(calculateStreak(habits, today), 3);
  });

  it("breaks streak on day with only uncompleted habits", () => {
    const habits = [
      { completed: true, date: new Date("2026-06-10") },
      { completed: false, date: new Date("2026-06-09") },
      { completed: true, date: new Date("2026-06-08") },
    ];
    assert.equal(calculateStreak(habits, today), 1);
  });

  it("counts day with mixed completed/uncompleted as streak", () => {
    const habits = [
      { completed: true, date: new Date("2026-06-10") },
      { completed: false, date: new Date("2026-06-10") },
      { completed: true, date: new Date("2026-06-09") },
    ];
    assert.equal(calculateStreak(habits, today), 2);
  });

  it("returns 0 when today has no completed habits", () => {
    const habits = [
      { completed: false, date: new Date("2026-06-10") },
      { completed: true, date: new Date("2026-06-09") },
    ];
    assert.equal(calculateStreak(habits, today), 0);
  });
});
