import { revalidatePath } from "next/cache";
import { apiError, apiOk, authorizeApi, readJson } from "@/lib/api";

const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/**
 * Changes one goal's start_date (only that). A start date after today puts the goal on hold:
 * small and grey on the Work page, its tasks out of the counts and calendar, until that day.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;

  const body = await readJson(request);
  const start = typeof body === "object" && body !== null ? (body as Record<string, unknown>).start_date : undefined;
  if (!isDate(start)) return apiError(400, "start_date: YYYY-MM-DD.");

  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return apiError(404, `No goal with id "${id}".`);
  const { data, error } = await auth.supabase
    .from("goals")
    .update({ start_date: start })
    .eq("user_id", auth.ownerId)
    .eq("id", id)
    .select("id, title, start_date, deadline");
  if (error) console.error(`PATCH /api/goals failed: ${error.message}`);
  if (error) return apiError(500, "Couldn't save the goal.");
  if (data.length === 0) return apiError(404, `No goal with id "${id}".`);

  revalidatePath("/", "layout");
  return apiOk({ goal: data[0] });
}
