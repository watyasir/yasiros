import { createServiceClient } from "@/lib/supabase/service";

/**
 * GET /api/health for an uptime monitor: 200 when the site runs and the database answers, 503
 * when it doesn't. No token and no data: just "ok" and which part is down.
 */
export async function GET() {
  const supabase = createServiceClient();
  let database: "up" | "down" | "not set up" = "not set up";
  if (supabase) {
    const { error } = await supabase.from("seasons").select("id").limit(1);
    database = error ? "down" : "up";
  }
  const ok = database === "up";
  if (!ok) console.error(`GET /api/health: database ${database}`);
  return Response.json({ ok, database }, { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
