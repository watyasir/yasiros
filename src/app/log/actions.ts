"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { assertValidValue, todayISO, type CheckInValues } from "@/lib/trackers";
import type { SaveResult } from "@/lib/body";

/** Saves today's check-in: one entry per tracker, replacing anything already logged today. */
export async function saveCheckIn(values: CheckInValues): Promise<SaveResult> {
  const { supabase, user } = await requireUser();
  const ids = Object.keys(values);
  if (ids.length === 0) return { ok: true };

  // Only this user's trackers come back (row-level security), so foreign ids are dropped here.
  const { data: trackers, error: readError } = await supabase.from("trackers").select("id, name, type").in("id", ids);
  if (readError) return { ok: false, message: "Couldn't reach the database. Try again." };

  const entryDate = todayISO();
  try {
    const rows = trackers.map((t) => {
      const value = Number(values[t.id]);
      assertValidValue(t, value);
      return { user_id: user.id, tracker_id: t.id, entry_date: entryDate, value };
    });
    const { error } = await supabase.from("entries").upsert(rows, { onConflict: "tracker_id,entry_date" });
    if (error) return { ok: false, message: "Couldn't save. Check your connection and try again." };
    // The dashboard (and a reopened check-in) show the new numbers straight away.
    revalidatePath("/");
    revalidatePath("/log");
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Couldn't save." };
  }
  return { ok: true };
}
