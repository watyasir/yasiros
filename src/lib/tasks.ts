/*
  Task and goal shapes, shared by the real dashboard and /demo.
  Matches supabase/migrations/…_tasks_goals.sql, …_tasks_api.sql and …_my_day_gate_jobs.sql.
*/

export type TaskStatus = "todo" | "doing" | "waiting" | "done";
export type Owner = "Me" | "Claude" | "Both";

export interface Task {
  id: string;
  title: string;
  area: string;
  /** YYYY-MM-DD, or null for no due date. */
  due: string | null;
  status: TaskStatus;
  owner: Owner;
  /** A short line under the title, or null. */
  note: string | null;
  /** Higher = more important. Claude sets it through the API. */
  order: number;
  /** ISO time the task moved to Done, or null. */
  doneAt: string | null;
  /** The goal this task is part of (Work page), or null = a loose task. */
  goalId: string | null;
  /** YYYY-MM-DD it starts; until then it's on hold. null = already going. */
  start: string | null;
}

/** What the task sheet saves. */
export interface NewTask {
  title: string;
  area: string;
  due: string | null;
  status: TaskStatus;
  note: string;
  owner: Owner;
  /** The Work card it's on; null = loose. */
  goalId: string | null;
  /** "Starts on": on hold until then. */
  start: string | null;
}

/** The Board columns, in order. */
export const TASK_COLUMNS: { status: TaskStatus; name: string }[] = [
  { status: "todo", name: "To do" },
  { status: "doing", name: "In progress" },
  { status: "waiting", name: "Waiting on others" },
  { status: "done", name: "Done" },
];

export const OWNERS: Owner[] = ["Me", "Claude", "Both"];

export const TASK_STATUSES = TASK_COLUMNS.map((c) => c.status);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** What's wrong with a new task, or null if it can be saved. */
export function taskProblem(t: NewTask): string | null {
  if (!t.title.trim()) return "Give the task a title.";
  if (t.title.trim().length > 120) return "Keep the title under 120 characters.";
  if (t.area.trim().length > 40) return "Keep the area under 40 characters.";
  if (t.due && !ISO_DATE.test(t.due)) return "Pick a due date from the calendar.";
  if (t.start && !ISO_DATE.test(t.start)) return "Pick a start date from the calendar.";
  if (!TASK_STATUSES.includes(t.status)) return "Pick a column.";
  if (t.note.trim().length > 500) return "Keep the note under 500 characters.";
  if (!OWNERS.includes(t.owner)) return "Pick who's on it.";
  return null;
}

/** On hold: starts after today (dates in India). It turns active by itself on the day. */
export const notStarted = (start: string | null | undefined, today: string) => !!start && start > today;

/**
 * Which tasks are on hold: their own start date is still ahead, or their goal's is.
 * `goals` = the goals with their start dates (YYYY-MM-DD).
 */
export function heldTasks(tasks: Pick<Task, "id" | "start" | "goalId">[], goals: { id: string; start: string | null }[], today: string): Set<string> {
  const heldGoals = new Set(goals.filter((g) => notStarted(g.start, today)).map((g) => g.id));
  return new Set(tasks.filter((t) => notStarted(t.start, today) || (t.goalId !== null && heldGoals.has(t.goalId))).map((t) => t.id));
}

/**
 * Open work: not done and not on hold. The Work tab's number, the Work subtitle and every goal
 * card count with this, so the cards add up to the tab and a tick shows everywhere at once.
 */
export function openTasks<T extends Pick<Task, "id" | "start" | "goalId" | "status">>(tasks: T[], goals: { id: string; start: string | null }[], today: string): T[] {
  const held = heldTasks(tasks, goals, today);
  return tasks.filter((t) => t.status !== "done" && !held.has(t.id));
}

/** One group per goal (in the goals' order), then the loose tasks (no goal, or one that's gone) if any. */
export function byGoal<T extends Pick<Task, "goalId">>(tasks: T[], goalIds: string[]): { goalId: string | null; tasks: T[] }[] {
  const known = new Set(goalIds);
  const groups: { goalId: string | null; tasks: T[] }[] = goalIds.map((id) => ({ goalId: id, tasks: tasks.filter((t) => t.goalId === id) }));
  const loose = tasks.filter((t) => !t.goalId || !known.has(t.goalId));
  if (loose.length) groups.push({ goalId: null, tasks: loose });
  return groups;
}

/** The Work subtitle: "5 open · 1 overdue · 2 due today", or "No open tasks". `open` from openTasks. */
export function workSummary(open: Task[], today: string): string {
  if (open.length === 0) return "No open tasks";
  const overdue = open.filter((t) => dueState(t, today) === "overdue").length;
  const dueToday = open.filter((t) => t.due === today).length;
  return `${open.length} open${overdue ? ` · ${overdue} overdue` : ""}${dueToday ? ` · ${dueToday} due today` : ""}`;
}

function dueState(task: Task, today: string): "soon" | "overdue" | undefined {
  if (!task.due || task.status === "done") return undefined;
  if (task.due < today) return "overdue";
  const [y, m, d] = today.split("-").map(Number);
  const inThree = new Date(Date.UTC(y, m - 1, d + 3)).toISOString().slice(0, 10);
  return task.due <= inThree ? "soon" : undefined;
}

// ---------------------------------------------------------------- goals

export interface Goal {
  id: string;
  title: string;
  area: string;
  target: number;
  unit: string | null;
  /** YYYY-MM-DD or null. */
  deadline: string | null;
  /** YYYY-MM-DD the goal starts; on hold until then. */
  start: string | null;
  /** null = progress typed in by hand. */
  trackerId: string | null;
  /** Hand-typed progress (ignored when linked to a tracker). */
  current: number;
}

export interface NewGoal {
  title: string;
  area: string;
  target: number | null;
  unit: string;
  deadline: string | null;
  trackerId: string | null;
}

export function goalProblem(g: NewGoal): string | null {
  if (!g.title.trim()) return "Give the goal a name.";
  if (g.title.trim().length > 60) return "Keep the name under 60 characters.";
  if (g.target == null || !(g.target > 0)) return "Set a target above 0.";
  if (g.unit.trim().length > 12) return "Keep the unit short, like kg or km.";
  if (g.deadline && !ISO_DATE.test(g.deadline)) return "Pick a deadline from the calendar.";
  return null;
}
