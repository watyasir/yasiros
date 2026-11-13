import type { FocusKey } from "@/lib/checkin-sections";
import type { SaveResult } from "@/lib/body";
import type { CheckInValues, Tracker } from "@/lib/trackers";
import type { GalleryItem } from "@/lib/gallery";
import type { ThemeId } from "@/lib/theme";
import type { Tone } from "@/lib/tones";
import type { NewTask, Owner, Task, TaskStatus } from "@/lib/tasks";

export type { Owner, Task };

/*
  The shape of everything the dashboard shows. /demo fills it with fake data
  (src/data/demo); from Phase 3 the real dashboard fills it from Supabase.
*/

/**
 * Each view has its own address: / (overview), /health, /finance, /work (the 4 tabs) and /gallery
 * (opened from Settings), and the same under /demo.
 */
export type ViewId = "overview" | "health" | "finance" | "work" | "gallery";

/** One day's value on a line chart. */
export interface Point {
  date: string;
  value: number;
}

export type SeasonDay = "all" | "most" | "missed" | "today" | "upcoming";

/** A Winter Arc dot: full or partial check-in, missed, today with nothing saved yet, or still ahead. */
export type HeroDay = "full" | "partial" | "missed" | "today" | "ahead";

/** One bank account or card in the Money wallet stack. Card balances are negative (amount owed). */
export interface Account {
  id: string;
  name: string;
  kind: "savings" | "current" | "card" | "other";
  balance: number;
  /** Cards only: next bill due date, e.g. "5 Nov". */
  due?: string;
  /** Latest first. Positive = money in. The finance snapshots don't carry these. */
  transactions?: { label: string; date: string; amount: number }[];
}

/** Saves task changes. Only the real dashboard passes these; the demo changes stay on the page. */
/** Saves today's values for one check-in section; only the trackers sent change. */
export type SaveCheckin = (values: CheckInValues) => Promise<SaveResult>;

/** Reads and deletes gallery files. Only the real dashboard passes these; the demo uses data.gallery. */
export interface GalleryActions {
  list: () => Promise<{ ok: true; items: GalleryItem[] } | { ok: false }>;
  remove: (id: string) => Promise<{ ok: boolean }>;
}

/** A task save's answer; `at` = server time (ms) it landed, so older cached lists get the change laid over them. */
export type TaskSaved = { ok: true; at: number } | { ok: false };

export interface TaskActions {
  add: (task: NewTask) => Promise<TaskSaved>;
  update: (id: string, task: NewTask) => Promise<TaskSaved>;
  move: (id: string, status: TaskStatus) => Promise<TaskSaved>;
  remove: (id: string) => Promise<TaskSaved>;
}

/*
  Real data can be missing while a source isn't connected or nothing is logged yet.
  null / empty lists mean "show the empty state", which tells you what to log.
*/
export interface DashboardData {
  /** The saved theme (Candy on the demo). */
  theme: ThemeId;
  ownerLine: string;
  /** YYYY-MM-DD the dashboard counts as today (fixed on the demo). */
  todayISO: string;
  /** "" for the real app, "/demo" for the demo: every view's address starts with it. */
  basePath: "" | "/demo";
  /** Where "Log Today" goes: /demo/log on the demo, /log for real. */
  logHref: string;
  /** Work's subtitle is only a lead-in ("Sample data" on the demo); the page adds the live task counts. */
  views: Record<ViewId, { title: string; subtitle: string }>;
  season: {
    name: string;
    length: number;
    /** 0 = started. Before the start date: days until day 1. */
    startsIn: number;
    day: number;
    streak: number;
    targetsHitPct: number;
    bestStreak: number;
    missed: number;
    startLabel: string;
    endLabel: string;
    days: SeasonDay[];
  } | null;
  /** The Overview hero. null = no season set up. */
  hero: {
    /** 1..length once started; 0 before day 1. */
    day: number;
    length: number;
    /** Before day 1: days until it starts. */
    startsIn: number;
    daysLeft: number;
    /** Season days so far with anything logged. */
    checkIns: number;
    finishLabel: string;
    /** Day 1, YYYY-MM-DD. */
    start: string;
    /** One per season day. */
    days: HeroDay[];
    /** Days in a row with a saved check-in, up to today (or yesterday while today is empty). */
    streak: number;
    /** -1 outside the season. */
    todayIndex: number;
  } | null;
  /** Anything logged today. */
  checkedIn: boolean;
  /** From the day plan. null = no plan sent yet. */
  plan: {
    /** "1:30–10:30 PM", "Weekend off", "No shift today". */
    shift: string;
    now: string | null;
    /** The shift phase in minutes after midnight (India); null on a day off. */
    shiftStart: number | null;
    shiftEnd: number | null;
    /** The next phase today: "Revision at 10:00 AM". null = nothing left today. */
    next: string | null;
  } | null;
  /**
   * Today's 5 things (Overview "Today" tile), from today's check-in data (DESIGN.md §4 has the
   * mapping): check-in logged, workout or walk, all 7 meals logged, study/revision, reading.
   */
  focus: { key: FocusKey; label: string; done: boolean }[];
  /**
   * What the Today card's section sheets need (v10.2): the 5 sections' trackers, the values the
   * sheet starts on (today's, else the last one or a sensible default), whether a session was
   * logged today (counts as Workout), and the ids saved today.
   */
  checkin: { trackers: Tracker[]; values: CheckInValues; saved: string[]; workedOut: boolean };
  /** Hours: wake time minus lights out, else the Sleep tracker. */
  sleep: Point[];
  /** Today's meal slots. status = the logged option ("Planned", "Swapped", "Skipped"), null = not logged. */
  meals: { name: string; status: string | null }[];
  /** Today's readings, "118/76". */
  bp: { label: string; value: string | null }[];
  /** Winter Arc: 0-100 per season day so far. */
  consistency: Point[];
  /** Winter Arc targets and streaks per tracker, for GET /api/summary (not shown on a page since v10). null = no season. */
  arc: {
    /** "26 Oct 2026 → 23 Jan 2027" */
    rangeLabel: string;
    /** Season week today is in (1-based; 1 before the start), out of weekCount. */
    week: number;
    weekCount: number;
    /** This season week, per tracker: days on target so far against the days it asks for. */
    targets: { name: string; done: number; target: number }[];
    /** Days in a row on target, per tracker. */
    streaks: { name: string; current: number; best: number }[];
    /** % of tracker targets hit in each season week. null = week not started yet. */
    weeks: (number | null)[];
  } | null;
  money: {
    month: string;
    updated: string;
    income: number;
    spent: number;
    /** What's left to spend this month (the wallet's front card). */
    spendable: number;
    /** % of income, actual against target (50/20/30 by default). */
    split: Record<"needs" | "wants" | "savings", { actual: number; target: number }>;
    /** Biggest spends first, at most 4. */
    categories: { name: string; amount: number }[];
    accounts: Account[];
  } | null;
  /** Where the workout log and the weekly body check live (/log/... or /demo/log/...). */
  workoutHref: string;
  bodyHref: string;
  workouts: {
    /** Days with a workout this week (Monday to today). */
    weekCount: number;
    /** From the "Workout done" tracker's weekly target. null = no target. */
    weekTarget: number | null;
    /** This week's sessions, latest first. */
    week: { day: string; name: string; summary: string }[];
    /** The latest session, for "Repeat last workout". null = none logged yet. */
    last: { name: string; when: string; summary: string } | null;
  };
  /** Check-in and weekly body check readings, last 90 days. */
  weight: { unit: "kg"; goal: number | null; points: Point[] };
  bodyCheck: {
    /** "Today", "3 days ago", "11 Oct". null = never done. */
    lastLabel: string | null;
    /** A week or more since the last check. */
    due: boolean;
    /** Latest measurements, with the change since the check before. */
    measures: { label: string; value: string; change: number | null }[];
  };
  /** Where goals are added and updated (/log/goals or /demo/log/goals). */
  goalsHref: string;
  /** The shareable Winter Arc card (/progress or /demo/progress). */
  shareHref: string;
  /** /settings, or /demo/settings (Gallery, Claude's jobs, about the themes). */
  settingsHref: string;
  /** `start`: YYYY-MM-DD; a goal is on hold (small, grey on Work) until then. */
  /** `saving` = a money goal (unit ₹, or "fund"/"saving" in the name): Finance's "Saving for". */
  goals: { id: string; name: string; area: string; deadline: string | null; start: string | null; progress: string; pct: number; by: string; tone: Tone; saving: boolean }[];
  /** Open tasks plus the ones done in the last two weeks. */
  tasks: Task[];
  /** The demo's gallery. null on the real dashboard: the gallery loads when it's opened. */
  gallery: GalleryItem[] | null;
}
