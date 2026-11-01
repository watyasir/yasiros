"use client";

import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";
import type { HeroDay } from "@/modules/types";

const DOT: Record<HeroDay, string> = {
  full: "bg-accent",
  partial: "bg-accent/45",
  missed: "bg-ink/12",
  today: "bg-ink/12",
  ahead: "border border-ink/20",
};

/**
 * Winter Arc as one short, full-width strip: Day X / 90, the streak flame, average consistency,
 * and the 90 days as a thin row of dots (two rows on phones). Opens Health, where the full hero is.
 */
export function ArcStrip() {
  const { data } = useDashboard();
  const hero = data.hero;
  const href = viewHref(data.basePath, "health");
  if (!hero) {
    return (
      <Tile title="Winter Arc" href={href} tone="weight" area="arc" tilt>
        <p className="m-0 text-sm text-soft">Set the start date in Settings to begin the 90 days.</p>
      </Tile>
    );
  }
  const avg = data.consistency.length ? Math.round(data.consistency.reduce((n, p) => n + p.value, 0) / data.consistency.length) : null;
  return (
    <Tile title="Winter Arc" href={href} tone="weight" area="arc" tilt>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <p className="display m-0 text-[32px] leading-none">
          {hero.day >= 1 ? (
            <>
              Day {hero.day} <span className="text-xl text-soft">/ {hero.length}</span>
            </>
          ) : (
            `Starts in ${hero.startsIn} ${hero.startsIn === 1 ? "day" : "days"}`
          )}
        </p>
        {hero.streak > 0 && (
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <span aria-hidden="true" className="inline-block origin-bottom animate-flame">
              🔥
            </span>
            {hero.streak} day streak
          </span>
        )}
        {avg != null && <span className="text-sm font-semibold">{avg}% consistent</span>}
      </div>
      <ol
        aria-label={`${hero.checkIns} of ${hero.length} days checked in`}
        className="m-0 grid list-none grid-cols-[repeat(45,minmax(0,1fr))] gap-[3px] p-0 min-[561px]:grid-cols-[repeat(90,minmax(0,1fr))]"
      >
        {hero.days.map((d, i) => (
          <li
            key={i}
            aria-hidden="true"
            className={`aspect-square rounded-full ${DOT[d]} ${i === hero.todayIndex ? "animate-pulse-ring outline-2 outline-offset-1 outline-accent" : ""}`}
          />
        ))}
      </ol>
    </Tile>
  );
}
