/*
  Task and goal shapes, shared by the real dashboard and /demo.
  Matches supabase/migrations/…_tasks_goals.sql, …_tasks_api.sql, …_my_day_gate_jobs.sql and …_tasks_goal_id.sql.
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
  /** The goal this task belongs to (v10), or null = a loose task. Always null until the goal_id migration has run. */
  goalId: string | null;
}

/** What the task sheet saves. */
export interface NewTask {
  title: string;
  area: string;
  due: string | null;
  status: TaskStatus;
  note: string;
  owner: Owner;
  goalId: string | null;
}

/** The task statuses, in order (the sheet's "Status" choice). */
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
  if (!TASK_STATUSES.includes(t.status)) return "Pick a column.";
  if (t.note.trim().length > 500) return "Keep the note under 500 characters.";
  if (!OWNERS.includes(t.owner)) return "Pick who's on it.";
  return null;
}

/** Work order: overdue first, then soonest due, then most important. */
export function workOrder(today: string) {
  const late = (t: Task) => Number(!(t.due != null && t.due < today));
  return (a: Task, b: Task) => late(a) - late(b) || (a.due ?? "9999").localeCompare(b.due ?? "9999") || b.order - a.order;
}

/** Postgres/PostgREST say this when tasks.goal_id isn't there yet (the v10 migration hasn't run). */
export function missingGoalColumn(error: { code?: string; message?: string } | null | undefined): boolean {
  return !!error && (error.code === "42703" || error.code === "PGRST204" || /goal_id/.test(error.message ?? ""));
}

export function dueState(task: Task, today: string): "soon" | "overdue" | undefined {
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
