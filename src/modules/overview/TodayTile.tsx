"use client";

import { useEffect, useState } from "react";
import { SectionSheet } from "@/components/checkin/SectionSheet";
import { useSectionSave } from "@/components/checkin/useSectionSave";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useConfetti } from "@/components/useConfetti";
import type { FocusKey } from "@/lib/checkin-sections";
import { formatDayLabel } from "@/lib/trackers";

const CELEBRATED = "yasiros-five-done";

/**
 * Today's 5 things (dark hero): "3 of 5 done", a bar, a button per item, what's left, and the next
 * phase from the day plan. Each button opens just that section of the check-in in a sheet
 * (v10.2); saving it ticks the button and moves the count at once. 5 of 5 gets one confetti burst
 * a day on this device. The mapping to trackers is in DESIGN.md §4 and src/lib/checkin-sections.ts.
 */
export function TodayTile() {
  const { data, saveCheckin } = useDashboard();
  const confetti = useConfetti();
  const checkin = useSectionSave(data.checkin, saveCheckin);
  const [open, setOpen] = useState<FocusKey | null>(null);
  const items = data.focus.map((i) => ({ ...i, done: checkin.done(i.key) }));
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
      <ul aria-label="Today's things" className="relative z-10 m-0 flex list-none flex-wrap gap-1.5 p-0">
        {items.map((i) => (
          <li key={i.key}>
            <button
              type="button"
              onClick={() => setOpen(i.key)}
              aria-label={`${i.label}: ${i.done ? "done" : "not yet"}. Log ${i.label.toLowerCase()}`}
              className={`press min-h-11 cursor-pointer rounded-full border-0 px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                i.done ? "bg-dot-on text-hero" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {i.done ? "✓ " : ""}
              {i.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-1 text-sm">
        <p className="m-0 font-semibold text-white">{left.length ? `Left: ${left.join(", ")}` : "All done. Nice day."}</p>
        {data.plan?.next && <p className="m-0 text-hero-soft">Next: {data.plan.next}</p>}
      </div>
      {open && (
        <SectionSheet
          section={open}
          trackers={data.checkin.trackers}
          initialValues={checkin.values}
          dayLabel={formatDayLabel(data.todayISO)}
          workoutHref={data.workoutHref}
          onClose={() => setOpen(null)}
          onSave={(values) => {
            setOpen(null);
            checkin.run(open, values);
          }}
        />
      )}
    </Tile>
  );
}
