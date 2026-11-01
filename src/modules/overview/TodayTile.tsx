"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useConfetti } from "@/components/useConfetti";

const CELEBRATED = "yasiros-five-done";

/**
 * Today's 5 things (dark hero, read-only): "3 of 5 done", a bar, a chip per item, what's left,
 * and the next phase from the day plan. The whole tile opens the check-in, where they're logged.
 * 5 of 5 gets one confetti burst a day on this device. The mapping to trackers is in DESIGN.md §4.
 */
export function TodayTile() {
  const { data } = useDashboard();
  const confetti = useConfetti();
  const items = data.focus;
  const done = items.filter((i) => i.done).length;
  const left = items.filter((i) => !i.done).map((i) => i.label);
  const allDone = items.length > 0 && done === items.length;

  useEffect(() => {
    if (!allDone || data.basePath === "/demo") return;
    try {
      if (localStorage.getItem(CELEBRATED) === data.todayISO) return;
      localStorage.setItem(CELEBRATED, data.todayISO);
    } catch {
      return;
    }
    confetti({ count: 120 });
  }, [allDone, data.basePath, data.todayISO, confetti]);

  return (
    <Tile title="Today" tone="hero" area="today" tilt className="relative">
      <p className="display m-0 text-[44px] leading-none sm:text-[56px]">
        {done} <span className="text-[24px] text-hero-soft sm:text-[28px]">of {items.length} done</span>
      </p>
      <div
        role="progressbar"
        aria-label="Today's things done"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={items.length}
        className="h-2.5 shrink-0 overflow-hidden rounded-full bg-white/15"
      >
        <div className="h-full rounded-full bg-dot-on transition-[width] duration-700 ease-out" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
      </div>
      <ul aria-label="Today's things" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {items.map((i) => (
          <li
            key={i.label}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${i.done ? "bg-dot-on text-hero" : "bg-white/10 text-white"}`}
          >
            {i.done ? "✓ " : ""}
            {i.label}
            <span className="sr-only">{i.done ? ": done" : ": not yet"}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-1 text-sm">
        <p className="m-0 font-semibold text-white">{left.length ? `Left: ${left.join(", ")}` : "All done. Nice day."}</p>
        {data.plan?.next && <p className="m-0 text-hero-soft">Next: {data.plan.next}</p>}
      </div>
      {/* The whole tile is the link (its label is the tile's own words). */}
      <Link href={data.logHref} prefetch aria-label={`Open the check-in. ${done} of ${items.length} done`} className="absolute inset-0 z-10 rounded-tile">
        <span className="sr-only">Open the check-in</span>
      </Link>
    </Tile>
  );
}
