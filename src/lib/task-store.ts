import "server-only";
import type { createClient } from "./supabase/server";
import type { Goal, Owner, Task, TaskStatus } from "./tasks";

type Supabase = Awaited<ReturnType<typeof createClient>>;

type TaskRow = {
  id: string;
  title: string;
  area: string;
  due_date: string | null;
  status: TaskStatus;
  owner: Owner;
  note: string | null;
  sort_order: number;
  done_at: string | null;
  goal_id?: string | null;
  start_date?: string | null;
};

const BASE_COLUMNS = "id, title, area, due_date, status, owner, done_at, note, sort_order";
/**
 * Newest first: start_date (migration 20261113000001_task_start_date.sql), then goal_id
 * (20261102000001_task_goals.sql). Each is dropped while its migration hasn't run (Postgres 42703).
 */
const COLUMN_TRIES = [`${BASE_COLUMNS}, goal_id, start_date`, `${BASE_COLUMNS}, goal_id`, BASE_COLUMNS];

/**
 * Every task. Before a migration runs, its column doesn't exist: read without it (no goal =
 * every task loose; no start date = nothing on hold). Null = database error.
 */
export async function loadTasks(supabase: Supabase): Promise<Task[] | null> {
  const select = (columns: string) => supabase.from("tasks").select(columns).order("created_at").returns<TaskRow[]>();
  let res = await select(COLUMN_TRIES[0]);
  for (const columns of COLUMN_TRIES.slice(1)) if (res.error?.code === "42703") res = await select(columns);
  const { data, error } = res;
  if (error || !data) return null;
  return data.map((t) => ({
    id: t.id,
    title: t.title,
    area: t.area,
    due: t.due_date,
    status: t.status,
    owner: t.owner,
    note: t.note,
    order: t.sort_order,
    doneAt: t.done_at,
    goalId: t.goal_id ?? null,
    start: t.start_date ?? null,
  }));
}

/** Goals, nearest deadline first, with each linked tracker's total since the goal started. Null = database error. */
export async function loadGoals(supabase: Supabase): Promise<{ goals: Goal[]; tracked: Map<string, number> } | null> {
  const [goals, progress] = await Promise.all([
    supabase
      .from("goals")
      .select("id, title, area, target, unit, deadline, start_date, tracker_id, current")
      .order("deadline", { ascending: true, nullsFirst: false })
      .order("created_at"),
    supabase.from("goal_progress").select("goal_id, tracked"),
  ]);
  if (goals.error || progress.error) return null;
  return {
    goals: goals.data.map((g) => ({
      id: g.id,
      title: g.title,
      area: g.area,
      target: Number(g.target),
      unit: g.unit,
      deadline: g.deadline,
      start: g.start_date,
      trackerId: g.tracker_id,
      current: Number(g.current),
    })),
    tracked: new Map(progress.data.map((p) => [p.goal_id as string, Number(p.tracked)])),
  };
}
