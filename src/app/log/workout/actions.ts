"use server";

import { requireUser } from "@/lib/auth";
import { dashboardChanged } from "@/lib/dashboard/fresh";
import { workoutProblem, type SaveResult, type WorkoutInput } from "@/lib/body";
import { todayISO } from "@/lib/trackers";

/** Saves one session with all its sets, and ticks "Workout done" for that day. */
export async function saveWorkout(input: WorkoutInput): Promise<SaveResult> {
  const { supabase, user } = await requireUser();
  const problem = workoutProblem(input, todayISO());
  if (problem) return { ok: false, message: problem };

  const { error } = await supabase.rpc("save_workout", {
    p_date: input.date,
    p_name: input.name.trim(),
    p_sets: input.sets.map((s) => ({ exercise: s.exercise.trim(), reps: s.reps, weight_kg: s.weight })),
  });
  if (error) return { ok: false, message: "Couldn't save. Check your connection and try again." };

  // Keep the daily "Workout done" tick (streak, habits, stats) in step with the log.
  const { data: tracker } = await supabase.from("trackers").select("id").eq("slug", "workout").eq("type", "checkbox").maybeSingle();
  if (tracker) {
    await supabase
      .from("entries")
      .upsert({ user_id: user.id, tracker_id: tracker.id, entry_date: input.date, value: 1 }, { onConflict: "tracker_id,entry_date" });
  }
  dashboardChanged();
  return { ok: true };
}

/** Deletes one logged session (for mistakes). The day's "Workout done" tick stays as it is. */
export async function deleteWorkout(id: string): Promise<SaveResult> {
  const { supabase } = await requireUser();
  // Row-level security limits this to the user's own workouts.
  const { error } = await supabase.from("workouts").delete().eq("id", id);
  if (error) return { ok: false, message: "Couldn't delete. Try again." };
  dashboardChanged();
  return { ok: true };
}
