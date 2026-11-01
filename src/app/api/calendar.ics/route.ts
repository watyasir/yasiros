import { CALENDARS } from "@/lib/calendar";
import { compact, description, escape, event, fold, routineEvents } from "@/lib/calendar-feed";
import { parseDayPlan } from "@/lib/day-plan";
import { ownerClient } from "@/lib/owner";
import { isShareToken } from "@/lib/share-store";
import { addDays, todayISO } from "@/lib/trackers";

/*
  /api/calendar.ics?token=<SHARE_TOKEN>: a calendar feed for Apple Calendar (subscribe with
  webcal://). The day plan's phases repeat weekly on their days; tasks with a due date are
  all-day events. Read-only; the calendar app fetches it again about every hour.
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

  const [plan, tasks] = await Promise.all([
    supabase.from("day_plans").select("plan").eq("user_id", ownerId).maybeSingle(),
    supabase.from("tasks").select("id, title, status, due_date, note, next_steps").eq("user_id", ownerId).not("due_date", "is", null),
  ]);
  if (plan.error || tasks.error) {
    console.error(`GET /api/calendar.ics failed: ${(plan.error ?? tasks.error)!.message}`);
    return new Response("Couldn't read the calendar. Try again.", { status: 500 });
  }

  const today = todayISO();
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
    ...(cat && cat.key !== "tasks" ? [] : tasks.data).map((t) => {
      const due = t.due_date as string;
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
