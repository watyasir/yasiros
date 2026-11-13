"use server";

import { requireUser } from "@/lib/auth";
import { dashboardChanged } from "@/lib/dashboard/fresh";
import type { SaveResult } from "@/lib/body";
import { goalProblem, type NewGoal } from "@/lib/tasks";

const FAILED: SaveResult = { ok: false, message: "Couldn't save. Check your connection and try again." };

function done(): SaveResult {
  dashboardChanged();
  return { ok: true };
}

export async function addGoal(goal: NewGoal): Promise<SaveResult> {
  const problem = goalProblem(goal);
  if (problem) return { ok: false, message: problem };
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title: goal.title.trim(),
    area: goal.area,
    target: goal.target,
    unit: goal.trackerId ? null : goal.unit.trim() || null,
    deadline: goal.deadline,
    tracker_id: goal.trackerId,
  });
  return error ? FAILED : done();
}

/** Hand-typed progress ("I'm at 55 kg now"). */
export async function updateGoalProgress(id: string, current: number): Promise<SaveResult> {
  if (!(current >= 0)) return { ok: false, message: "Type a number, 0 or more." };
  const { supabase } = await requireUser();
  const { error } = await supabase.from("goals").update({ current }).eq("id", id);
  return error ? FAILED : done();
}

export async function deleteGoal(id: string): Promise<SaveResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("goals").delete().eq("id", id);
  return error ? FAILED : done();
}
