import "server-only";
import type { createClient } from "@/lib/supabase/server";
import { loadBodyChecks, loadWeightGoal, loadWorkouts } from "@/lib/body-store";
import { MONEY_COLUMNS, type MoneySnapshot } from "@/lib/money";
import { loadGoals, loadTasks } from "@/lib/task-store";
import { loadTheme } from "@/lib/theme-store";
import { loadTrackers } from "@/lib/tracker-store";
import { addDays, todayISO } from "@/lib/trackers";
import type { DashboardData } from "@/modules/types";
import { BODY_WEEKS } from "./body";
import { istMinutes, type DayPlan } from "@/lib/day-plan";
import { buildDashboardData, type EntryRow, type SeasonRow } from "./build";
import { CHART_DAYS } from "./extras";

type Supabase = Awaited<ReturnType<typeof createClient>>;

// Supabase returns at most 1,000 rows per request, so longer histories are read in pages.
const PAGE = 1000;

/**
 * Entries between two dates (inclusive), oldest first. Null = database error.
 * `userId` is only for the share card's server-side read, which isn't limited by row-level security.
 */
export async function loadEntries(supabase: Supabase, from: string, to: string, userId?: string): Promise<EntryRow[] | null> {
  const entries: EntryRow[] = [];
  for (let page = 0; ; page++) {
    let query = supabase.from("entries").select("tracker_id, entry_date, value");
    if (userId) query = query.eq("user_id", userId);
    const { data, error } = await query
      .gte("entry_date", from)
      .lte("entry_date", to)
      .order("entry_date")
      .order("tracker_id")
      .range(page * PAGE, page * PAGE + PAGE - 1);
    if (error) return null;
    entries.push(...data.map((e) => ({ ...e, value: Number(e.value) })));
    if (data.length < PAGE) return entries;
  }
}

/** Everything the real dashboard shows, read fresh on every visit. Null = couldn't reach the database. */
export async function loadDashboardData(supabase: Supabase): Promise<DashboardData | null> {
  const today = todayISO();
  const historyStart = addDays(today, -CHART_DAYS);
  const [trackers, seasonResult, workouts, bodyChecks, weightGoal, tasks, goals, recent, moneyResult, planResult, theme] = await Promise.all([
    loadTrackers(supabase),
    supabase.from("seasons").select("name, start_date, length_days, targets").eq("is_active", true).maybeSingle<SeasonRow>(),
    loadWorkouts(supabase, { since: addDays(today, -BODY_WEEKS * 7) }),
    // Weekly, so this covers the chart window plus the check before it.
    loadBodyChecks(supabase, BODY_WEEKS + 2),
    loadWeightGoal(supabase),
    loadTasks(supabase),
    loadGoals(supabase),
    loadEntries(supabase, historyStart, today),
    // Not fatal: before the money migration runs (or with no snapshot yet) the tile shows its empty state.
    supabase.from("money_snapshots").select(MONEY_COLUMNS).order("updated_at", { ascending: false }).limit(1).maybeSingle<MoneySnapshot>(),
    // Not fatal: no plan sent yet = the Today tile says so.
    supabase.from("day_plans").select("plan").maybeSingle<{ plan: DayPlan }>(),
    // Not fatal: no saved theme = Candy.
    loadTheme(supabase),
  ]);
  if (!trackers || seasonResult.error || !workouts || !bodyChecks || weightGoal === undefined || !tasks || !goals || !recent) return null;
  const season = seasonResult.data;

  // Once the season is older than the history window, read its earlier days too.
  let entries = recent;
  if (season && season.start_date < historyStart) {
    const earlier = await loadEntries(supabase, season.start_date, addDays(historyStart, -1));
    if (!earlier) return null;
    entries = [...earlier, ...recent];
  }

  return buildDashboardData({
    trackers,
    entries,
    season,
    today,
    nowMinutes: istMinutes(),
    dayPlan: planResult.data?.plan ?? null,
    workouts,
    bodyChecks,
    weightGoal,
    tasks,
    goals: goals.goals,
    goalTracked: goals.tracked,
    money: moneyResult.error ? null : moneyResult.data,
    theme,
  });
}
