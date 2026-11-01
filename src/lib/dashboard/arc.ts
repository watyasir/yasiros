import { addDays, formatAmount, formatValue, type Tracker } from "@/lib/trackers";
import type { DashboardData } from "@/modules/types";
import type { SeasonRow } from "./build";
import { daysBetween, shortDate } from "./dates";

// ---------------------------------------------------------------- Winter Arc page

export type HitOn = (t: Tracker, date: string, target?: number) => boolean;

/** "2026-10-26" -> "26 Oct 2026" */
function fullDate(iso: string): string {
  return `${shortDate(iso)} ${iso.slice(0, 4)}`;
}

/** The Winter Arc page: targets this week, streaks per tracker, week-by-week %. */
export function buildArc(
  season: SeasonRow,
  today: string,
  trackers: Tracker[],
  dailyGoals: { tracker: Tracker; target: number | undefined }[],
  hitOn: HitOn,
): NonNullable<DashboardData["arc"]> {
  const length = season.length_days;
  const end = addDays(season.start_date, length - 1);
  const weekCount = Math.ceil(length / 7);
  const dayNum = daysBetween(season.start_date, today) + 1;
  const started = dayNum >= 1;
  const weekIndex = started ? Math.min(Math.floor((dayNum - 1) / 7), weekCount - 1) : 0;

  /** Season days of week `w` (0-based) up to today. */
  const daysOfWeek = (w: number) => {
    const days: string[] = [];
    for (let i = w * 7; i < Math.min(w * 7 + 7, length); i++) {
      const d = addDays(season.start_date, i);
      if (d <= today) days.push(d);
    }
    return days;
  };
  const weekLength = (w: number) => Math.min(7, length - w * 7);

  // Daily targets, plus weekly yes/no ones like workouts ("5 days a week").
  const weekly = trackers.filter((t) => t.type === "checkbox" && t.target_period === "weekly" && t.target != null);
  const goals = [
    ...dailyGoals.map((g) => ({ tracker: g.tracker, target: g.target, perWeek: weekLength(weekIndex) })),
    ...weekly.filter((t) => !dailyGoals.some((g) => g.tracker.id === t.id)).map((t) => ({ tracker: t, target: undefined, perWeek: Number(t.target) })),
  ];
  // "Sleep 7 hr", "Study 1.5 hr"; "Steps 8,000" rather than "Steps 8,000 steps".
  const label = (t: Tracker, target: number | undefined) => {
    if (target == null || t.type === "checkbox" || t.type === "scale_1_5") return t.name;
    if (t.unit && t.unit.toLowerCase() === t.name.toLowerCase()) return `${t.name} ${formatAmount(target)}`;
    return `${t.name} ${formatValue(t, target)}`;
  };
  const thisWeek = started ? daysOfWeek(weekIndex) : [];

  return {
    rangeLabel: `${fullDate(season.start_date)} → ${fullDate(end)}`,
    week: weekIndex + 1,
    weekCount,
    targets: goals.map((g) => ({
      name: label(g.tracker, g.target),
      done: thisWeek.filter((d) => hitOn(g.tracker, d, g.target)).length,
      target: g.perWeek,
    })),
    streaks: goals.map((g) => {
      const hit = (d: string) => hitOn(g.tracker, d, g.target);
      let current = 0;
      for (let d = hit(today) ? today : addDays(today, -1); d >= season.start_date && hit(d); d = addDays(d, -1)) current++;
      let best = 0;
      let run = 0;
      for (let d = season.start_date; d <= today && d <= end; d = addDays(d, 1)) {
        run = hit(d) ? run + 1 : 0;
        best = Math.max(best, run);
      }
      return { name: label(g.tracker, g.target), current, best };
    }),
    weeks: Array.from({ length: weekCount }, (_, w) => {
      const days = daysOfWeek(w);
      if (days.length === 0 || dailyGoals.length === 0) return null;
      const hits = days.reduce((n, d) => n + dailyGoals.filter((g) => hitOn(g.tracker, d, g.target)).length, 0);
      return Math.round((hits / (days.length * dailyGoals.length)) * 100);
    }),
  };
}
