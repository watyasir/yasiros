import { SECTIONS, sectionTrackers } from "@/lib/checkin-sections";
import { defaultTrackers } from "@/lib/default-trackers";
import type { CheckInValues, Tracker } from "@/lib/trackers";
import type { DashboardData } from "@/modules/types";

/** The default trackers with made-up ids and values, for /demo/log. */
export const demoTrackers: Tracker[] = defaultTrackers.map((t) => ({
  unit: null,
  step: null,
  scale_labels: null,
  target: null,
  target_period: null,
  group_name: null,
  ...t,
  id: `demo-${t.slug}`,
}));

const sample: Record<string, number> = {
  sleep: 7,
  water: 2,
  workout: 1,
  steps: 6400,
  skincare: 1,
  hair: 0,
  study: 90,
  mood: 4,
  "lights-out": 30, // 12:30 AM
  wake: 450, // 7:30 AM
  "meal-1": 1,
  "meal-2": 1,
  "meal-3": 2, // swapped
  "meal-4": 1,
  "meal-5": 1,
  "meal-6": 3, // skipped
  "meal-7": 1,
  "bp-am-sys": 118,
  "bp-am-dia": 76,
  // Evening reading not taken yet: blank, so it isn't saved.
  "reading-page": 142,
  weight: 58.4,
};

export const demoCheckInValues: CheckInValues = Object.fromEntries(demoTrackers.map((t) => [t.id, sample[t.slug]]));

/*
  The Today card's section sheets on /demo. Matches the demo's "3 of 5": sleep, workout and
  revision saved today; meals and reading start on their usual values but aren't saved yet.
*/
const sectionOwn = SECTIONS.flatMap((s) => sectionTrackers(s.key, demoTrackers));
export const demoCheckin: DashboardData["checkin"] = {
  trackers: sectionOwn,
  values: Object.fromEntries(sectionOwn.map((t) => [t.id, demoCheckInValues[t.id]])),
  saved: [...sectionTrackers("sleep", demoTrackers), ...sectionTrackers("workout", demoTrackers), ...sectionTrackers("revision", demoTrackers)].map((t) => t.id),
  workedOut: true,
};

