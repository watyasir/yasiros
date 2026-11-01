import { addDays, type Tracker } from "@/lib/trackers";
import type { DayPlan } from "@/lib/day-plan";
import type { DashboardData, SeasonDay } from "@/modules/types";
import type { BodyCheck, Workout } from "@/lib/body";
import { dueState, type Goal, type Task } from "@/lib/tasks";
import { toMoneyTile, type MoneySnapshot } from "@/lib/money";
import { buildBody } from "./body";
import { buildGoals } from "./goals";
import { buildArc } from "./arc";
import { daysBetween, headerDate, shortDate } from "./dates";
import { dailyTarget } from "./today";
import { buildBp, buildConsistency, buildHero, buildMeals, buildPlan, buildSeries, buildTodayCheck } from "./extras";
import { DEFAULT_THEME, type ThemeId } from "@/lib/theme";

/*
  Turns the real rows (trackers, entries, the active season) into the same DashboardData
  shape /demo uses, so both run on the same tiles. Pure: no database, easy to reason about.
  Sources with nothing in them yet (money before the first snapshot) come back
  empty and the tiles show what to do instead.
*/

export interface EntryRow {
  tracker_id: string;
  entry_date: string;
  value: number;
}

export interface SeasonRow {
  name: string;
  start_date: string;
  length_days: number;
  /** { "<tracker slug>": <daily target> }. Empty = use each tracker's own daily target. */
  targets: Record<string, number>;
}

interface BuildInput {
  trackers: Tracker[];
  entries: EntryRow[];
  season: SeasonRow | null;
  today: string;
  /** Minutes since midnight in India, for what's on now in the day plan. */
  nowMinutes: number;
  dayPlan: DayPlan | null;
  /** Latest first. */
  workouts: Workout[];
  /** Latest first. */
  bodyChecks: BodyCheck[];
  weightGoal: number | null;
  tasks: Task[];
  /** false (the default) until the goal_id migration has run. */
  goalLinks?: boolean;
  goals: Goal[];
  /** Linked-tracker totals by goal id. */
  goalTracked: Map<string, number>;
  /** The latest money snapshot. Null/missing = none pushed yet. */
  money?: MoneySnapshot | null;
  /** The saved theme; Candy when none. */
  theme?: ThemeId;
}



// ---------------------------------------------------------------- the build

export function buildDashboardData({
  trackers,
  entries,
  season,
  today,
  nowMinutes,
  dayPlan,
  workouts,
  bodyChecks,
  weightGoal,
  tasks,
  goalLinks,
  goals,
  goalTracked,
  money,
  theme,
}: BuildInput): DashboardData {
  const values = new Map<string, number>();
  for (const e of entries) values.set(`${e.tracker_id}|${e.entry_date}`, Number(e.value));
  const valueOn = (t: Tracker, date: string) => values.get(`${t.id}|${date}`);

  /** Did this tracker hit its daily bar on this date? */
  const hitOn = (t: Tracker, date: string, target = dailyTarget(t)) => {
    const v = valueOn(t, date);
    if (v === undefined) return false;
    if (t.type === "checkbox") return v >= 1;
    return target == null ? true : v >= target;
  };

  // The trackers a day is judged on. A season can name its own; otherwise every daily target counts.
  const seasonTargets = season && Object.keys(season.targets).length > 0 ? season.targets : null;
  const dailyGoals: { tracker: Tracker; target: number | undefined }[] = seasonTargets
    ? trackers.filter((t) => t.slug in seasonTargets).map((t) => ({ tracker: t, target: seasonTargets[t.slug] }))
    : trackers.filter((t) => dailyTarget(t) != null).map((t) => ({ tracker: t, target: dailyTarget(t) ?? undefined }));

  const dayStatus = (date: string): "all" | "most" | "missed" => {
    if (dailyGoals.length === 0) return "missed";
    const hits = dailyGoals.filter((g) => hitOn(g.tracker, date, g.target)).length;
    if (hits === dailyGoals.length) return "all";
    return hits / dailyGoals.length >= 0.5 ? "most" : "missed";
  };
  const counts = (date: string) => dayStatus(date) !== "missed";

  // Streak: today counts once it's hit; until then the streak runs to yesterday.
  let streak = 0;
  for (let d = counts(today) ? today : addDays(today, -1); counts(d) && streak < 3650; d = addDays(d, -1)) streak++;

  const workoutTracker = trackers.find((t) => t.slug === "workout");
  const body = buildBody({
    workouts,
    bodyChecks,
    today,
    workoutDays: workoutTracker ? entries.filter((e) => e.tracker_id === workoutTracker.id && e.value >= 1).map((e) => e.entry_date) : [],
    weekTarget: workoutTracker?.target_period === "weekly" && workoutTracker.target != null ? Number(workoutTracker.target) : null,
  });

  const open = tasks.filter((t) => t.status !== "done");
  const overdue = open.filter((t) => dueState(t, today) === "overdue").length;
  const dueToday = open.filter((t) => t.due === today).length;

  const loggedDays = new Set(entries.map((e) => e.entry_date));
  const series = buildSeries(trackers, valueOn, bodyChecks, today);
  const goalTiles = buildGoals(goals, goalTracked, trackers, today);
  const consistency = buildConsistency(season, trackers, valueOn, today);

  return {
    theme: theme ?? DEFAULT_THEME,
    basePath: "",
    todayISO: today,
    logHref: "/log",
    shareHref: "/progress",
    views: {
      overview: { title: headerDate(today), subtitle: "" },
      gallery: { title: "Gallery", subtitle: "Images and files Claude saved from chats" },
      finance: { title: "Finance", subtitle: money ? `${money.month} · updated by the finance task` : "Waiting for the first snapshot" },
      health: { title: "Health", subtitle: "Winter Arc, weight, sleep, workouts, meals and blood pressure" },
      work: {
        title: "Work",
        subtitle: open.length === 0 ? "No open tasks" : `${open.length} open${overdue ? ` · ${overdue} overdue` : ""}${dueToday ? ` · ${dueToday} due today` : ""}`,
      },
    },
    navBadges: open.length ? { work: String(open.length) } : {},
    season: season ? buildSeason(season, today, dayStatus, counts, dailyGoals.length) : null,
    arc: season ? buildArc(season, today, trackers, dailyGoals, hitOn) : null,
    hero: buildHero(season, today, loggedDays, consistency),
    checkedIn: loggedDays.has(today),
    plan: buildPlan(dayPlan, today, nowMinutes),
    sleep: series.sleep,
    meals: buildMeals(trackers, valueOn, today),
    todayCheck: buildTodayCheck(trackers, valueOn, today, loggedDays.has(today)),
    bp: buildBp(trackers, valueOn, today),
    consistency,
    money: money ? toMoneyTile(money) : null,
    workoutHref: "/log/workout",
    bodyHref: "/log/body",
    goalsHref: "/log/goals",
    settingsHref: "/settings",
    ...body,
    weight: { unit: "kg", goal: weightGoal, points: series.weight },
    goals: goalTiles,
    tasks,
    goalLinks: goalLinks ?? false,
    gallery: null,
  };
}

function buildSeason(
  season: SeasonRow,
  today: string,
  dayStatus: (date: string) => "all" | "most" | "missed",
  counts: (date: string) => boolean,
  goalCount: number,
): NonNullable<DashboardData["season"]> {
  const length = season.length_days;
  const dayNum = Math.min(Math.max(daysBetween(season.start_date, today) + 1, 0), length);
  const days: SeasonDay[] = Array.from({ length }, (_, i) => {
    if (i < dayNum - 1) return dayStatus(addDays(season.start_date, i));
    return i === dayNum - 1 ? "today" : "upcoming";
  });

  // Past days only: today is still in progress.
  const past = Array.from({ length: Math.max(dayNum - 1, 0) }, (_, i) => addDays(season.start_date, i));
  let best = 0;
  let run = 0;
  for (const d of [...past, ...(counts(today) ? [today] : [])]) {
    run = counts(d) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  let streak = 0;
  for (let d = counts(today) ? today : addDays(today, -1); d >= season.start_date && counts(d); d = addDays(d, -1)) streak++;
  const hitDays = past.filter((d) => dayStatus(d) === "all").length;

  return {
    name: season.name,
    length,
    startsIn: Math.max(0, daysBetween(today, season.start_date)),
    day: dayNum,
    streak,
    targetsHitPct: past.length && goalCount ? Math.round((hitDays / past.length) * 100) : 0,
    bestStreak: best,
    missed: past.filter((d) => dayStatus(d) === "missed").length,
    startLabel: shortDate(season.start_date),
    endLabel: shortDate(addDays(season.start_date, length - 1)),
    days,
  };
}
