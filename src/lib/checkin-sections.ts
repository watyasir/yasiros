import type { Tracker } from "./trackers";

/*
  The check-in in sections (v10.2): Today's 5 things on the Overview and the rows on /log are the
  same 5 sections, plus "More" on /log for everything else. One tap opens one section; saving it
  writes only its trackers. Which trackers belong where, and when a section counts as done
  (DESIGN.md §4), live here so the Today card, /log and buildFocus can never disagree.
*/

export const SECTIONS = [
  { key: "sleep", label: "Sleep", slugs: ["lights-out", "wake"] },
  { key: "workout", label: "Workout", slugs: ["workout"] },
  { key: "meals", label: "Meals", group: "Meals" },
  { key: "revision", label: "Revision", slugs: ["study"] },
  { key: "reading", label: "Reading", slugs: ["reading-page"] },
] as const;

export type FocusKey = (typeof SECTIONS)[number]["key"];
export type SectionKey = FocusKey | "more";

const inSection = (s: (typeof SECTIONS)[number], t: Tracker) =>
  "group" in s ? t.type === "choice" && t.group_name === s.group : (s.slugs as readonly string[]).includes(t.slug);

/** The trackers one section shows. "more" = every tracker none of the 5 sections has. */
export function sectionTrackers(key: SectionKey, trackers: Tracker[]): Tracker[] {
  if (key === "more") return trackers.filter((t) => !SECTIONS.some((s) => inSection(s, t)));
  const section = SECTIONS.find((s) => s.key === key)!;
  return trackers.filter((t) => inSection(section, t));
}

export const isSectionKey = (v: unknown): v is SectionKey => v === "more" || SECTIONS.some((s) => s.key === v);

export const sectionLabel = (key: SectionKey) => (key === "more" ? "More" : SECTIONS.find((s) => s.key === key)!.label);

/**
 * Is a section done today? `today(t)` = the value saved for today, undefined if none.
 * Sleep: lights out and woke up both saved. Workout: the tick, or a session logged today.
 * Meals: every slot saved. Revision: study above 0. Reading: pages read saved.
 */
export function sectionDone(key: FocusKey, trackers: Tracker[], today: (t: Tracker) => number | undefined, workedOut = false): boolean {
  const own = sectionTrackers(key, trackers);
  if (own.length === 0) return key === "workout" && workedOut;
  switch (key) {
    case "sleep":
    case "meals":
    case "reading":
      return own.every((t) => today(t) !== undefined);
    case "workout":
      return workedOut || (today(own[0]) ?? 0) >= 1;
    case "revision":
      return (today(own[0]) ?? 0) > 0;
  }
}
