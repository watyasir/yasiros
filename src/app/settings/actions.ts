"use server";

import { requireUser } from "@/lib/auth";
import { dashboardChanged } from "@/lib/dashboard/fresh";
import { createSignInCode } from "@/lib/signin-code";
import type { SaveResult } from "@/lib/body";
import { SEASON_DAYS, SEASON_NAME, seasonProblem, slugify, trackerProblem, type SeasonInput, type TrackerInput } from "@/lib/settings";
import { isTheme, type ThemeId } from "@/lib/theme";

const FAILED: SaveResult = { ok: false, message: "Couldn't save. Check your connection and try again." };

function done(): SaveResult {
  dashboardChanged();
  return { ok: true };
}

/** Starts (or reschedules) Winter Arc: one active season, 90 days, with its targets. */
export async function saveSeason(input: SeasonInput): Promise<SaveResult> {
  const problem = seasonProblem(input);
  if (problem) return { ok: false, message: problem };
  const { supabase, user } = await requireUser();
  const { data: active, error } = await supabase.from("seasons").select("id").eq("is_active", true).maybeSingle();
  if (error) return FAILED;
  const row = { start_date: input.start, length_days: SEASON_DAYS, targets: input.targets };
  const saved = active
    ? await supabase.from("seasons").update(row).eq("id", active.id)
    : await supabase.from("seasons").insert({ ...row, user_id: user.id, name: SEASON_NAME, is_active: true });
  return saved.error ? FAILED : done();
}

/** A new tracker. It shows up in /log and on the dashboard straight away. */
export async function addTracker(input: TrackerInput): Promise<SaveResult> {
  const problem = trackerProblem(input);
  if (problem) return { ok: false, message: problem };
  const { supabase, user } = await requireUser();
  const { data: existing, error } = await supabase.from("trackers").select("slug, sort_order");
  if (error) return FAILED;

  // A unique slug: "reading", then "reading-2", "reading-3"...
  const base = slugify(input.name);
  const taken = new Set(existing.map((t) => t.slug));
  let slug = base;
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;

  const yesNo = input.type === "checkbox";
  const { error: insertError } = await supabase.from("trackers").insert({
    user_id: user.id,
    slug,
    name: input.name.trim(),
    area: input.area,
    type: input.type,
    unit: input.type === "duration_minutes" ? "min" : yesNo || input.type === "scale_1_5" ? null : input.unit.trim() || null,
    // A yes/no done every day has a daily target of 1.
    target: yesNo && input.period === "daily" && input.target != null ? 1 : input.target,
    target_period: input.target == null ? null : input.period,
    sort_order: Math.max(0, ...existing.map((t) => t.sort_order)) + 10,
  });
  return insertError ? FAILED : done();
}

/**
 * Clears the test numbers: entries, workouts (and their sets), body checks, tasks and goals.
 * Trackers, the season and settings stay.
 */
export async function resetTestData(): Promise<SaveResult> {
  const { supabase, user } = await requireUser();
  // Each workout's sets are deleted with it.
  for (const table of ["goals", "tasks", "body_checks", "workouts", "entries"] as const) {
    const { error } = await supabase.from(table).delete().eq("user_id", user.id);
    if (error) return { ok: false, message: `Stopped while clearing ${table.replace("_", " ")}. Run it again to finish clearing.` };
  }
  return done();
}

/** A one-time code for signing in on another device (the iPhone home-screen app). */
export async function makeSignInCode(): Promise<{ ok: true; code: string; expiresAt: number } | { ok: false; message: string }> {
  const { user } = await requireUser();
  const made = await createSignInCode(user.id);
  return made ? { ok: true, ...made } : { ok: false, message: "Couldn't make a code. The site needs SUPABASE_SERVICE_ROLE_KEY." };
}

/** Appearance: saves the chosen theme (user_prefs). The page has already switched; this keeps it on every device. */
export async function saveTheme(theme: ThemeId): Promise<{ ok: boolean }> {
  if (!isTheme(theme)) return { ok: false };
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("user_prefs").upsert({ user_id: user.id, theme, updated_at: new Date().toISOString() });
  return { ok: !error };
}
