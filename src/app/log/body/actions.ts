"use server";

import { requireUser } from "@/lib/auth";
import { dashboardChanged } from "@/lib/dashboard/fresh";
import { bodyCheckProblem, type BodyCheckInput, type SaveResult } from "@/lib/body";
import { todayISO } from "@/lib/trackers";

/** Saves the weekly body check (one per date, saving again replaces it) and the goal weight. */
export async function saveBodyCheck(input: BodyCheckInput): Promise<SaveResult> {
  const { supabase, user } = await requireUser();
  const problem = bodyCheckProblem(input, todayISO());
  if (problem) return { ok: false, message: problem };

  const [check, settings] = await Promise.all([
    supabase.from("body_checks").upsert(
      {
        user_id: user.id,
        check_date: input.date,
        weight_kg: input.weight,
        waist_cm: input.waist,
        chest_cm: input.chest,
        arms_cm: input.arms,
        progress_photo: input.photo,
      },
      { onConflict: "user_id,check_date" },
    ),
    supabase.from("user_settings").upsert({ user_id: user.id, weight_goal_kg: input.goal }, { onConflict: "user_id" }),
  ]);
  if (check.error || settings.error) return { ok: false, message: "Couldn't save. Check your connection and try again." };
  dashboardChanged();
  return { ok: true };
}
