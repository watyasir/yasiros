import type { Metadata } from "next";
import { Suspense } from "react";
import { SheetSkeleton } from "@/components/Skeleton";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { requireUser } from "@/lib/auth";
import { JOB_COLUMNS } from "@/lib/claude-jobs";
import { shareToken } from "@/lib/share-store";
import { weekStart } from "@/lib/dashboard/dates";
import { loadTrackers } from "@/lib/tracker-store";
import { addDays, todayISO } from "@/lib/trackers";
import { loadTheme } from "@/lib/theme-store";
import { addTracker, makeSignInCode, resetTestData, saveSeason, saveTheme } from "./actions";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<SheetSkeleton label="Loading settings" />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  const { supabase } = await requireUser();
  const [trackers, season, theme, jobs] = await Promise.all([
    loadTrackers(supabase),
    supabase.from("seasons").select("start_date, targets").eq("is_active", true).maybeSingle<{ start_date: string; targets: Record<string, number> }>(),
    loadTheme(supabase),
    // Not fatal: no jobs yet = the section's empty note.
    supabase.from("claude_jobs").select(JOB_COLUMNS).order("next_run", { ascending: true, nullsFirst: false }).order("name"),
  ]);
  if (!trackers || season.error) {
    return <p className="p-6 text-center text-[15px] text-danger">Couldn&apos;t load your settings. Refresh to try again.</p>;
  }
  return (
    <SettingsForm
      trackers={trackers}
      season={season.data ? { start: season.data.start_date, targets: season.data.targets } : null}
      defaultStart={addDays(weekStart(todayISO()), 7)}
      actions={{ saveSeason, addTracker, resetTestData, makeSignInCode, saveTheme }}
      theme={theme}
      calendarPath={calendarPath()}
      jobs={(jobs.data ?? []).map((j) => ({ name: j.name, schedule: j.schedule, status: j.status, lastRun: j.last_run, nextRun: j.next_run }))}
    />
  );
}

/** The feeds' shared address; each one adds &cat=<key>. Null = SHARE_TOKEN isn't set. */
function calendarPath(): string | null {
  const token = shareToken();
  return token ? `/api/calendar.ics?token=${encodeURIComponent(token)}` : null;
}
