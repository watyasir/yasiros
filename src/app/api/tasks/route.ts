import { revalidatePath } from "next/cache";
import { apiError, apiOk, authorizeApi, readJson } from "@/lib/api";
import { apiOwner, parseStatusFilter, parseTaskUpserts, TASK_API_COLUMNS } from "@/lib/task-api";
import type { Owner } from "@/lib/tasks";

type TaskRow = { owner: Owner } & Record<string, unknown>;
type Supabase = Exclude<Awaited<ReturnType<typeof authorizeApi>>, Response>["supabase"];
const toApi = (rows: TaskRow[]) => rows.map((t) => ({ ...t, owner: apiOwner(t.owner) }));

/**
 * The columns to read and write: with goal_id once migration 20261102000001_task_goals.sql has
 * run (Postgres says 42703 "column does not exist" before that).
 */
async function columnsFor(supabase: Supabase): Promise<{ columns: string; hasGoal: boolean }> {
  const { error } = await supabase.from("tasks").select("goal_id").limit(1);
  const hasGoal = error?.code !== "42703";
  return { columns: hasGoal ? `${TASK_API_COLUMNS}, goal_id` : TASK_API_COLUMNS, hasGoal };
}

/** Lists the Board's tasks, most important first. ?status=todo,doing filters by column. */
export async function GET(request: Request) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;

  const statuses = parseStatusFilter(new URL(request.url).searchParams.get("status"));
  if (typeof statuses === "string") return apiError(400, statuses);

  const { columns } = await columnsFor(auth.supabase);
  let query = auth.supabase.from("tasks").select(columns).eq("user_id", auth.ownerId);
  if (statuses) query = query.in("status", statuses);
  const { data, error } = await query
    .order("sort_order", { ascending: false })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at")
    .returns<TaskRow[]>();
  if (error) console.error(`GET /api/tasks failed: ${error.message}`);
  if (error) return apiError(500, "Couldn't read the tasks. Has the tasks API migration been run?");
  return apiOk({ count: data.length, tasks: toApi(data) });
}

/** Adds or updates tasks by external_id. New tasks need a title; existing ones change only the fields sent. */
export async function POST(request: Request) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;
  const { supabase, ownerId } = auth;

  const parsed = parseTaskUpserts(await readJson(request));
  if (!parsed.ok) {
    console.warn(`POST /api/tasks rejected: ${parsed.error}`);
    return apiError(400, parsed.error);
  }

  const { columns, hasGoal } = await columnsFor(supabase);
  const goalIds = [...new Set(parsed.tasks.map((t) => t.goal_id).filter((g): g is string => typeof g === "string"))];
  if (parsed.tasks.some((t) => t.goal_id !== undefined) && !hasGoal) {
    return apiError(400, "goal_id: the task-goals migration (20261102000001_task_goals.sql) hasn't been run yet.");
  }
  if (goalIds.length) {
    const goals = await supabase.from("goals").select("id").eq("user_id", ownerId).in("id", goalIds);
    if (goals.error) return apiError(500, "Couldn't read the goals.");
    const missing = goalIds.find((id) => !goals.data.some((g) => g.id === id));
    if (missing) return apiError(400, `goal_id: no goal with id "${missing}".`);
  }

  const existing = await supabase
    .from("tasks")
    .select("external_id")
    .eq("user_id", ownerId)
    .in("external_id", parsed.tasks.map((t) => t.external_id));
  if (existing.error) console.error(`POST /api/tasks lookup failed: ${existing.error.message}`);
  if (existing.error) return apiError(500, "Couldn't read the tasks. Has the tasks API migration been run?");
  const known = new Set(existing.data.map((r) => r.external_id as string));

  const fresh = parsed.tasks.filter((t) => !known.has(t.external_id));
  const untitled = fresh.find((t) => !t.title);
  if (untitled) return apiError(400, `title: "${untitled.external_id}" is a new task, so it needs a title.`);

  // Missing fields on a new task take the table's defaults (To do, owner Yasir, no area).
  const inserted = fresh.length
    ? await supabase.from("tasks").insert(fresh.map((t) => ({ ...t, user_id: ownerId })), { defaultToNull: false }).select(columns).returns<TaskRow[]>()
    : { data: [] as TaskRow[], error: null };
  const updated = await Promise.all(
    parsed.tasks
      .filter((t) => known.has(t.external_id))
      .map((t) => supabase.from("tasks").update(t).eq("user_id", ownerId).eq("external_id", t.external_id).select(columns).single<TaskRow>()),
  );
  const failed = [inserted, ...updated].find((r) => r.error)?.error;
  if (failed) console.error(`POST /api/tasks save failed: ${failed.message}`);
  if (failed) return apiError(500, "Couldn't save every task; the ones listed by GET /api/tasks are what's saved.");

  revalidatePath("/", "layout");
  const insertedRows = inserted.data ?? [];
  const updatedRows = updated.map((r) => r.data as TaskRow);
  return apiOk({ created: insertedRows.length, updated: updatedRows.length, tasks: toApi([...insertedRows, ...updatedRows]) });
}
