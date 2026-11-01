"use client";

import Link from "next/link";
import { Group } from "@/components/FormGroup";
import { timeAgo, useNow } from "@/components/useNow";
import type { ClaudeJob, JobStatus } from "@/lib/claude-jobs";

/*
  /settings (and /demo/settings) since v10: links to the Gallery and the share card, and Claude's
  scheduled jobs. They left the tabs to keep the app to 4 pages.
*/

/** Gallery and the Winter Arc share card. */
export function MoreSection({ galleryHref, shareHref }: { galleryHref: string; shareHref: string }) {
  const row = "press flex min-h-[52px] items-center justify-between gap-3 text-[17px] text-ink no-underline";
  return (
    <Group title="More">
      <Link href={galleryHref} prefetch className={row}>
        Gallery
        <span aria-hidden="true" className="text-soft">
          →
        </span>
      </Link>
      <Link href={shareHref} prefetch className={row}>
        Winter Arc share card
        <span aria-hidden="true" className="text-soft">
          →
        </span>
      </Link>
    </Group>
  );
}

/** Status dot + word (never colour alone). */
const STATUS: Record<JobStatus, { dot: string; label: string }> = {
  ok: { dot: "bg-ok", label: "OK" },
  failed: { dot: "bg-danger", label: "Failed" },
  running: { dot: "bg-accent", label: "Running" },
  scheduled: { dot: "bg-line-strong", label: "Scheduled" },
  paused: { dot: "bg-line-strong", label: "Paused" },
};

/** Claude's scheduled jobs, as Claude reports them through /api/claude-jobs: status, schedule, last and next run. */
export function ClaudeJobsSection({ jobs }: { jobs: ClaudeJob[] }) {
  const now = useNow();
  return (
    <Group title="Claude's jobs">
      {jobs.length === 0 && <p className="m-0 py-3 text-[15px] text-soft">None reported yet. Claude adds them through POST /api/claude-jobs.</p>}
      {jobs.map((j) => (
        <div key={j.name} className="flex flex-col gap-1 py-3">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0 text-[15px] leading-snug font-semibold">{j.name}</span>
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
        </div>
      ))}
    </Group>
  );
}
