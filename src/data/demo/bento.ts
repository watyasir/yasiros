import { addDays } from "@/lib/trackers";
import type { DashboardData, HeroDay, Point } from "@/modules/types";
import { DEMO_TODAY } from "./body";

/*
  Made-up numbers for the Overview tiles and charts on /demo. "Today" is 18 Oct 2026,
  day 23 of a season that started 26 Sep. Nothing here is real.
*/

/** A gentle made-up wave, the same on every build. */
const wave = (i: number, seed: number) => Math.sin(i * 0.9 + seed) * 0.5 + Math.sin(i * 0.37 + seed * 2) * 0.5;

function daily(days: number, value: (i: number) => number | null): Point[] {
  return Array.from({ length: days }, (_, i) => ({ date: addDays(DEMO_TODAY, i - days + 1), v: value(i) }))
    .filter((p): p is { date: string; v: number } => p.v != null)
    .map(({ date, v }) => ({ date, value: v }));
}

const SEASON_START = "2026-09-26";
// Days 8 and 16 were missed; every third day was partial; everything else up to today is a full check-in.
const days: HeroDay[] = Array.from({ length: 90 }, (_, i) => (i > 22 ? "ahead" : i === 7 || i === 15 ? "missed" : i % 3 === 2 ? "partial" : "full"));

export const demoBento: Pick<
  DashboardData,
  "hero" | "checkedIn" | "plan" | "focus" | "sleep" | "meals" | "bp" | "consistency" | "weight"
> = {
  hero: { day: 23, length: 90, startsIn: 0, daysLeft: 67, checkIns: 21, finishLabel: "24 Dec", start: SEASON_START, days, streak: 7, todayIndex: 22 },
  checkedIn: true,
  // 18 Oct 2026 is a Sunday.
  plan: { shift: "Weekend off", now: "Rest and review till 9:00 PM", shiftStart: 810, shiftEnd: 1350, next: "Lights out at 12:30 AM" },
  focus: [
    { key: "sleep", label: "Sleep", done: true },
    { key: "workout", label: "Workout", done: true },
    { key: "meals", label: "Meals", done: false },
    { key: "revision", label: "Revision", done: true },
    { key: "reading", label: "Reading", done: false },
  ],
  weight: {
    unit: "kg",
    goal: 76,
    // Rising about 0.5 kg a week, weighed most days.
    points: daily(90, (i) => (i % 5 === 3 ? null : Math.round((68.6 + i * 0.07 + wave(i, 1) * 0.3) * 10) / 10)),
  },
  sleep: daily(90, (i) => Math.round((7 + wave(i, 3) * 0.9) * 10) / 10),
  meals: [
    { name: "Pre-gym", status: "Planned" },
    { name: "Breakfast", status: "Planned" },
    { name: "Lunch", status: "Swapped" },
    { name: "Snack 1", status: "Planned" },
    { name: "Dinner", status: null },
    { name: "Snack 2", status: null },
    { name: "Night", status: null },
  ],
  bp: [
    { label: "Morning", value: "118/76" },
    { label: "Evening", value: null },
  ],
  consistency: Array.from({ length: 23 }, (_, i) => ({
    date: addDays(SEASON_START, i),
    value: i === 7 || i === 15 ? 12 : Math.round(72 + wave(i, 4) * 14 + i * 0.4),
  })),
};
