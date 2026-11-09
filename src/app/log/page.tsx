import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { SheetSkeleton } from "@/components/Skeleton";
import { CheckInHub } from "@/components/checkin/CheckInHub";
import { MoreLogs } from "@/components/checkin/MoreLogs";
import { currentOwner, requireUser } from "@/lib/auth";
import { loadTrackersWithStatus } from "@/lib/tracker-store";
import { addDays, formatDayLabel, startingValue, todayISO, type CheckInValues } from "@/lib/trackers";
import { saveCheckIn } from "./actions";

export const metadata: Metadata = { title: "Check-in" };

export default function LogPage() {
  return (
    <Suspense fallback={<SheetSkeleton label="Loading your check-in" />}>
      <TodayCheckIn />
    </Suspense>
  );
}

async function TodayCheckIn() {
  const data = await loadCheckIn();
  // Not signed in as the owner: requireUser sends them to /login (and signs out other emails).
  if (!data) {
    await requireUser();
    return null;
  }
  if ("error" in data) {
    return <p className="p-6 text-center text-[15px] text-danger">Couldn&apos;t load your trackers. Refresh to try again.</p>;
  }
  const { trackers, initial, saved, workedOut, dayLabel, pending } = data;

  return (
    <CheckInHub
      trackers={trackers}
      values={initial}
      saved={saved}
      workedOut={workedOut}
      dayLabel={dayLabel}
      homeHref="/"
      workoutHref="/log/workout"
      save={saveCheckIn}
      notice={pending ? "Update pending: lights out, wake, meals, blood pressure and reading appear here once the database update is run." : undefined}
      moreLinks={<MoreLogs workoutHref="/log/workout" bodyHref="/log/body" settingsHref="/settings" />}
      footer={
        <form action="/auth/signout" method="post" className="flex justify-center pt-2">
          <button type="submit" className="min-h-11 cursor-pointer rounded-full border-0 bg-transparent px-3 text-[15px] text-soft hover:text-ink">
            Sign out
          </button>
        </form>
      }
    />
  );
}

/*
  Everything the check-in needs: trackers, the values each section starts on, what's saved today and
  whether a workout was logged. A private cache (per signed-in browser, never shared on the server),
  so the Check-in button can load it ahead of the tap and the list opens instantly. Fresh for 60 seconds;
  the form keeps your edits in the page anyway, and saving updates the database directly.
*/
async function loadCheckIn() {
  "use cache: private";
  cacheLife({ stale: 60 });
  const owner = await currentOwner();
  if (!owner) return null;
  const { supabase } = owner;

  // Latest value per tracker over the last 2 weeks: today's if logged, otherwise the most recent day.
  const today = todayISO();
  const [loaded, { data: recent }, { count: sessions }] = await Promise.all([
    loadTrackersWithStatus(supabase),
    supabase
      .from("entries")
      .select("tracker_id, entry_date, value")
      .gte("entry_date", addDays(today, -14))
      .order("entry_date", { ascending: false }),
    supabase.from("workouts").select("id", { count: "exact", head: true }).eq("workout_date", today),
  ]);
  if (!loaded) return { error: true as const };
  const { trackers, pending } = loaded;

  const latest = new Map<string, { date: string; value: number }>();
  for (const e of recent ?? []) {
    if (!latest.has(e.tracker_id)) latest.set(e.tracker_id, { date: e.entry_date, value: Number(e.value) });
  }
  const initial: CheckInValues = {};
  const saved: string[] = [];
  for (const t of trackers) {
    const last = latest.get(t.id);
    if (last?.date === today) saved.push(t.id);
    initial[t.id] = last?.date === today ? last.value : startingValue(t, last?.value);
  }
  return { trackers, initial, saved, workedOut: (sessions ?? 0) > 0, dayLabel: formatDayLabel(today), pending };
}
