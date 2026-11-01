"use client";

import { EmptyNote } from "@/components/EmptyNote";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";
import type { HeroDay } from "@/modules/types";
import { useLiveArc } from "./HeroTile";

// The same dots as the Health hero, drawn for a light tile: dark when done, half when partial.
const DOT: Record<HeroDay, string> = {
  full: "bg-hero",
  partial: "bg-[linear-gradient(to_top,var(--th-hero)_50%,color-mix(in_srgb,var(--th-ink)_14%,transparent)_50%)]",
  missed: "bg-ink/15",
  today: "bg-ink/15",
  ahead: "border border-ink/25",
};

/**
 * Winter Arc as one short strip (full width): Day N / 90, the streak flame, how consistent the
 * days have been, and the 90 days as thin bars. The whole strip opens the Winter Arc hero on Health.
 */
export function ArcStrip() {
  const { data } = useDashboard();
  const live = useLiveArc();
  const href = viewHref(data.basePath, "health");
  if (!live) {
    return (
      <Tile title="Winter Arc" href={href} stretch tone="fund" area="arc" tilt>
        <EmptyNote>Set the start date in Settings to begin the 90 days.</EmptyNote>
      </Tile>
    );
  }
  const { hero, days, streak } = live;
  const started = hero.day >= 1;
  const points = data.consistency;
  const pct = points.length ? Math.round(points.reduce((n, p) => n + p.value, 0) / points.length) : null;

  return (
    <Tile
      title="Winter Arc"
      href={href}
      stretch
      tone="fund"
      area="arc"
      tilt
      className="gap-2.5"
      aside={
        streak > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 text-sm font-semibold">
            <span aria-hidden="true" className="inline-block origin-bottom animate-flame">
              🔥
            </span>
            {streak} day streak
          </span>
        )
      }
    >
      <p className="m-0 flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
        <span className="display text-[32px] leading-none">
          {started ? (
            <>
              Day {hero.day} <span className="text-[18px] text-soft">/ {hero.length}</span>
            </>
          ) : (
            `Starts in ${hero.startsIn} ${hero.startsIn === 1 ? "day" : "days"}`
          )}
        </span>
        {pct != null && <span className="text-sm font-semibold">{pct}% consistent</span>}
      </p>
      <ol
        aria-label={`${hero.checkIns} of ${hero.length} days checked in`}
        className="m-0 grid list-none grid-cols-[repeat(45,minmax(0,1fr))] gap-[2px] p-0 min-[561px]:grid-cols-[repeat(90,minmax(0,1fr))]"
      >
        {days.map((d, i) => (
          <li key={i} aria-hidden="true" className={`h-2.5 rounded-full ${DOT[d]} ${i === hero.todayIndex ? "outline-2 outline-offset-1 outline-hero" : ""}`} />
        ))}
      </ol>
    </Tile>
  );
}
