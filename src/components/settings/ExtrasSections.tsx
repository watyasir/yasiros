"use client";

import { EmptyNote } from "@/components/EmptyNote";
import { Tile } from "@/components/Tile";
import { timeAgo, useNow } from "@/components/useNow";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import type { JobStatus } from "@/lib/claude-jobs";

/** Status dot + word (never colour alone). */
const STATUS: Record<JobStatus, { dot: string; label: string }> = {
  ok: { dot: "bg-ok", label: "OK" },
  failed: { dot: "bg-danger", label: "Failed" },
  running: { dot: "bg-accent", label: "Running" },
  scheduled: { dot: "bg-line-strong", label: "Scheduled" },
  paused: { dot: "bg-line-strong", label: "Paused" },
};

/**
 * Claude's scheduled tasks, beside the Board and kept apart from Yasir's tasks: own tile,
 * Claude-orange marker, no drag or edit. Claude reports them through /api/claude-jobs.
 */
export function ClaudeJobsPanel() {
  const jobs = useDashboard().data.claudeJobs;
  const now = useNow();
  return (
    <Tile title="Claude's scheduled tasks" aside={<span aria-hidden="true" className="size-2.5 rounded-full bg-claude" />} className="self-start">
      <p className="m-0 -mt-1 text-xs text-soft">Run by Claude on a timer. Not on your Board.</p>
      {jobs.length === 0 && <EmptyNote>None reported yet. Claude adds them through the API (POST /api/claude-jobs).</EmptyNote>}
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {jobs.map((j) => (
          <li key={j.name} className="flex flex-col gap-1 rounded-item border border-line bg-fill px-3 py-2.5">
            <span className="flex items-start justify-between gap-2">
              <span className="min-w-0 text-sm leading-snug font-semibold">{j.name}</span>
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold">
                <span aria-hidden="true" className={`size-2 rounded-full ${STATUS[j.status].dot}`} />
                {STATUS[j.status].label}
              </span>
            </span>
            {j.schedule && <span className="text-xs text-soft">{j.schedule}</span>}
            {now != null && (
              <span className="flex flex-wrap gap-x-3 font-mono text-xs text-soft">
                <span>Last run {timeAgo(j.lastRun, now)}</span>
                {j.nextRun && <span>Next {timeAgo(j.nextRun, now)}</span>}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Tile>
  );
}
