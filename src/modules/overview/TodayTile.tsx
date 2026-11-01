"use client";

import { useEffect } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useToast } from "@/components/Toast";
import { useConfetti } from "@/components/useConfetti";

const CELEBRATED = "yasiros-day-done";

/**
 * Today (dark hero), read-only: "3 of 5 done", a progress bar, what's left and the next phase of
 * the day plan. The whole tile opens the check-in. The five checks come from today's check-in data
 * (src/lib/dashboard/extras.ts, buildTodayCheck). All five: confetti and a toast, once a day on
 * this device.
 */
export function TodayTile() {
  const { data } = useDashboard();
  const toast = useToast();
  const confetti = useConfetti();
  const items = data.todayCheck;
  const left = items.filter((i) => !i.done);
  const done = items.length - left.length;
  const all = items.length > 0 && left.length === 0;
  const { plan, hero, basePath, todayISO } = data;
  const day = hero && hero.day >= 1 ? hero.day : null;

  useEffect(() => {
    if (!all || basePath === "/demo") return;
    try {
      if (localStorage.getItem(CELEBRATED) === todayISO) return;
      localStorage.setItem(CELEBRATED, todayISO);
    } catch {
      return;
    }
    confetti({ count: 120 });
    toast({ text: day ? `Day ${day} done. All ${items.length} in.` : "Day done. All in." });
  }, [all, basePath, todayISO, day, items.length, confetti, toast]);

  return (
    <Tile title="Today" href={data.logHref} stretch tone="hero" area="today" tilt className="gap-3">
      <p className="display m-0 text-[44px] leading-none sm:text-[56px]">
        {done} <span className="text-[24px] text-hero-soft sm:text-[28px]">of {items.length} done</span>
      </p>
      <ProgressBar pct={items.length ? Math.round((done / items.length) * 100) : 0} tone="pop" onDark thick label={`${done} of ${items.length} done today`} />
      <p className="m-0 text-base font-semibold">{all ? "All done. Nice day." : `Left: ${left.map((i) => i.label).join(", ")}`}</p>
      <p className="m-0 mt-auto text-sm text-hero-soft">{plan ? (plan.next ? `Next: ${plan.next}` : "Nothing more planned today.") : "No day plan yet."}</p>
    </Tile>
  );
}
