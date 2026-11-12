import { apiError, apiOk, authorizeApi } from "@/lib/api";

/** Lists the goals (id, title, start_date, deadline), nearest deadline first, for setting start dates. */
export async function GET(request: Request) {
  const auth = await authorizeApi(request);
  if (auth instanceof Response) return auth;

  const { data, error } = await auth.supabase
    .from("goals")
    .select("id, title, start_date, deadline")
    .eq("user_id", auth.ownerId)
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("created_at");
  if (error) console.error(`GET /api/goals failed: ${error.message}`);
  if (error) return apiError(500, "Couldn't read the goals.");
  return apiOk({ count: data.length, goals: data });
}
