import type { Tracker } from "@/lib/trackers";

/** A tracker's daily target, or null when it has none. */
export function dailyTarget(t: Tracker): number | null {
  if (t.target_period !== "daily" || t.target == null) return null;
  return Number(t.target);
}
