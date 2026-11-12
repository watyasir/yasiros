import { CALENDARS } from "@/lib/calendar";
import { compact, description, escape, event, fold, routineEvents } from "@/lib/calendar-feed";
import { parseDayPlan } from "@/lib/day-plan";
import { ownerClient } from "@/lib/owner";
import { isShareToken } from "@/lib/share-store";
import { heldTasks } from "@/lib/tasks";
import { addDays, todayISO } from "@/lib/trackers";

type TaskRow = { id: string; title: string; status: string; due_date: string; note: string | null; next_steps: string | null; start_date?: string | null; goal_id?: string | null };

/*
  /api/calendar.ics?token=<SHARE_TOKEN>: a calendar feed for Apple Calendar (subscribe with
  webcal://). The day plan's phases repeat weekly on their days; tasks with a due date are
  all-day events (on-hold ones only once they start). Read-only; the calendar app fetches it again about every hour.
  &cat=<key> gives one coloured feed per category (src/lib/calendar.ts); without it, everything
  comes in the one "Decko" feed as before.
*/

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if (!isShareToken(params.get("token") ?? undefined)) {
    return new Response("Not found", { status: 404 });
  }
  const catKey = params.get("cat");
  const cat = catKey === null ? null : CALENDARS.find((c) => c.key === catKey);
  if (cat === undefined) return new Response("Not found", { status: 404 });
  const owner = await ownerClient();
  if (!owner) return new Response("Calendar isn't set up", { status: 503 });
  const { supabase, ownerId } = owner;

  // start_date and goal_id come from later migrations: read without them until they've run (42703).
  const readTasks = (extra: string) =>
    supabase.from("tasks").select(`id, title, status, due_date, note, next_steps${extra}`).eq("user_id", ownerId).not("due_date", "is", null).returns<TaskRow[]>();
  const [plan, firstTasks, goals] = await Promise.all([
    supabase.from("day_plans").select("plan").eq("user_id", ownerId).maybeSingle(),
    readTasks(", start_date, goal_id"),
    supabase.from("goals").select("id, start_date").eq("user_id", ownerId),
  ]);
  let tasks = firstTasks;
  for (const extra of [", goal_id", ""]) if (tasks.error?.code === "42703") tasks = await readTasks(extra);
  if (plan.error || tasks.error || goals.error) {
    console.error(`GET /api/calendar.ics failed: ${(plan.error ?? tasks.error ?? goals.error)!.message}`);
    return new Response("Couldn't read the calendar. Try again.", { status: 500 });
  }

  const today = todayISO();
  // On-hold tasks (their own start date, or their goal's, still ahead) join the feed on that day.
  const shown = tasks.data!.map((t) => ({ ...t, start: t.start_date ?? null, goalId: t.goal_id ?? null }));
  const held = heldTasks(shown, goals.data.map((g) => ({ id: g.id, start: g.start_date })), today);
  const parsed = plan.data ? parseDayPlan(plan.data.plan) : null;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Decko//Calendar//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${cat ? `Decko · ${cat.name}` : "Decko"}`,
    ...(cat ? [`X-APPLE-CALENDAR-COLOR:${cat.color}`] : []),
    "X-WR-TIMEZONE:Asia/Kolkata",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
    // India has one offset all year, so the time zone is a single rule.
    "BEGIN:VTIMEZONE",
    "TZID:Asia/Kolkata",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0530",
    "TZOFFSETTO:+0530",
    "TZNAME:IST",
    "END:STANDARD",
    "END:VTIMEZONE",
    ...(parsed?.ok && cat?.key !== "tasks" ? routineEvents(parsed.plan, today, cat?.key) : []),
    ...(cat && cat.key !== "tasks" ? [] : shown.filter((t) => !held.has(t.id))).map((t) => {
      const due = t.due_date;
      return event([
        `UID:task-${t.id}@yasiros`,
        `DTSTART;VALUE=DATE:${compact(due)}`,
        `DTEND;VALUE=DATE:${compact(addDays(due, 1))}`,
        `SUMMARY:${escape(`${t.status === "done" ? "✓ " : ""}${t.title}`)}`,
        ...description([t.next_steps && `Next: ${t.next_steps}`, t.note].filter(Boolean).join("\n")),
        "TRANSP:TRANSPARENT",
      ]);
    }).flat(),
    "END:VCALENDAR",
  ];

  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="yasiros${cat ? `-${cat.key}` : ""}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
