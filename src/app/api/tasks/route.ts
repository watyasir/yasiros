import { revalidatePath } from "next/cache";
import { apiError, apiOk, authorizeApi, readJson } from "@/lib/api";
import { apiOwner, parseStatusFilter, parseTaskUpserts, TASK_API_COLUMNS, TASK_API_COLUMNS_GOAL } from "@/lib/task-api";
import { missingGoalColumn, type Owner } from "@/lib/tasks";

type TaskRow = { owner: Owner } & Record<string, unknown>;
const toApi = (rows: TaskRow[]) => rows.map((t) => ({ ...t, owner: apiOwner(t.owner) }));

/** Lists the Board's tasks, most important first. ?status=todo,doing filters by column. */
export async function GET(request: Request) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;

  const statuses = parseStatusFilter(new URL(request.url).searchParams.get("status"));
  if (typeof statuses === "string") return apiError(400, statuses);

  const read = (columns: string) => {
    let query = auth.supabase.from("tasks").select(columns).eq("user_id", auth.ownerId);
    if (statuses) query = query.in("status", statuses);
    return query
      .order("sort_order", { ascending: false })
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at")
      .returns<TaskRow[]>();
  };
  // goal_id comes with the answer once its migration has run; before that the plain list is sent.
  let { data, error } = await read(TASK_API_COLUMNS_GOAL);
  if (missingGoalColumn(error)) ({ data, error } = await read(TASK_API_COLUMNS));
  if (error) console.error(`GET /api/tasks failed: ${error.message}`);
  if (error || !data) return apiError(500, "Couldn't read the tasks. Has the tasks API migration been run?");
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

  // Only a request that sends goal_id needs the column (and asks for it back).
  const columns = parsed.tasks.some((t) => "goal_id" in t) ? TASK_API_COLUMNS_GOAL : TASK_API_COLUMNS;

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
  if (failed && missingGoalColumn(failed)) return apiError(400, "goal_id: tasks can't be linked to goals yet. The goal_id migration hasn't been run.");
  if (failed && (failed as { code?: string }).code === "23503") return apiError(400, "goal_id: there is no goal with that id.");
  if (failed) return apiError(500, "Couldn't save every task; the ones listed by GET /api/tasks are what's saved.");

  revalidatePath("/", "layout");
  const insertedRows = inserted.data ?? [];
  const updatedRows = updated.map((r) => r.data as TaskRow);
  return apiOk({ created: insertedRows.length, updated: updatedRows.length, tasks: toApi([...insertedRows, ...updatedRows]) });
}
