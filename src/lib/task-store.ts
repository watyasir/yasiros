import "server-only";
import type { createClient } from "./supabase/server";
import { missingGoalColumn, type Goal, type Owner, type Task, type TaskStatus } from "./tasks";

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
};

const TASK_COLUMNS = "id, title, area, due_date, status, owner, done_at, note, sort_order";

/**
 * Every task. Null = database error. `goalLinks` is false before the goal_id migration has run:
 * the column is left out, every task is loose, and the app keeps working.
 */
export async function loadTasks(supabase: Supabase): Promise<{ tasks: Task[]; goalLinks: boolean } | null> {
  let goalLinks = true;
  let res = await supabase.from("tasks").select(`${TASK_COLUMNS}, goal_id`).order("created_at").returns<TaskRow[]>();
  if (res.error && missingGoalColumn(res.error)) {
    goalLinks = false;
    res = await supabase.from("tasks").select(TASK_COLUMNS).order("created_at").returns<TaskRow[]>();
  }
  if (res.error || !res.data) return null;
  const tasks = res.data.map((t) => ({
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
  }));
  return { tasks, goalLinks };
}

/** Goals, nearest deadline first, with each linked tracker's total since the goal started. Null = database error. */
export async function loadGoals(supabase: Supabase): Promise<{ goals: Goal[]; tracked: Map<string, number> } | null> {
  const [goals, progress] = await Promise.all([
    supabase
      .from("goals")
      .select("id, title, area, target, unit, deadline, tracker_id, current")
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
      trackerId: g.tracker_id,
      current: Number(g.current),
    })),
    tracked: new Map(progress.data.map((p) => [p.goal_id as string, Number(p.tracked)])),
  };
}
