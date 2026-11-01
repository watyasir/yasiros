import type { Tone } from "@/lib/tones";
import { formatRupees } from "@/lib/format";
import { formatAmount, shortDate, type Tracker } from "@/lib/trackers";
import type { Goal } from "@/lib/tasks";
import type { DashboardData } from "@/modules/types";

const GOAL_TONES: Tone[] = ["accent", "pop"];

/** How far each goal is (Work cards, Finance "Saving for"). `tracked` = linked tracker totals by goal id. */
export function buildGoals(goals: Goal[], tracked: Map<string, number>, trackers: Tracker[], today: string): DashboardData["goals"] {
  return goals.map((g, i) => {
    const { now, unit } = goalNow(g, tracked, trackers);
    const pct = Math.min(100, Math.max(0, Math.round((now / g.target) * 100)));
    const u = unit ? ` ${unit}` : "";
    let by = g.deadline ? `by ${shortDate(g.deadline)}${g.deadline.slice(0, 4) !== today.slice(0, 4) ? ` ${g.deadline.slice(0, 4)}` : ""}` : "No deadline";
    if (pct >= 100) by = "Reached";
    else if (g.deadline && g.deadline < today) by = `Deadline passed · ${shortDate(g.deadline)}`;
    return {
      id: g.id,
      name: g.title,
      area: g.area,
      deadline: g.deadline,
      saving: isSaving(g),
      progress: isRupees(unit) ? `${formatRupees(now)} of ${formatRupees(g.target)}` : `${formatAmount(round1(now))} of ${formatAmount(g.target)}${u}`,
      pct,
      by,
      tone: pct >= 100 ? "ok" : GOAL_TONES[i % GOAL_TONES.length],
    };
  });
}

/** Current progress and the unit it's in. Linked time trackers count in hours. */
function goalNow(g: Goal, tracked: Map<string, number>, trackers: Tracker[]): { now: number; unit: string | null } {
  const tracker = g.trackerId ? trackers.find((t) => t.id === g.trackerId) : undefined;
  if (!tracker) return { now: g.current, unit: g.unit };
  const total = tracked.get(g.id) ?? 0;
  if (tracker.type === "duration_minutes") return { now: total / 60, unit: "hr" };
  if (tracker.type === "checkbox") return { now: total, unit: "days" };
  return { now: total, unit: tracker.unit };
}

const isRupees = (unit: string | null) => /^(₹|rs\.?|inr|rupees?)$/i.test((unit ?? "").trim());

/** A money goal: kept in rupees, or "fund" / "saving" in its name (Finance's "Saving for"). */
function isSaving(g: Goal): boolean {
  return isRupees(g.unit) || /\b(fund|saving|savings)\b/i.test(g.title);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
