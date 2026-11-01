"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";
import { addDays, shortDate } from "@/lib/trackers";
import type { HeroDay } from "@/modules/types";

const DOT: Record<HeroDay, string> = {
  full: "bg-dot-on",
  // Half filled from the bottom.
  partial: "bg-[linear-gradient(to_top,var(--th-dot-on)_50%,color-mix(in_srgb,var(--th-hero-soft)_22%,transparent)_50%)]",
  missed: "bg-hero-soft/20",
  today: "bg-hero-soft/20",
  ahead: "border border-hero-soft/35",
};

const WORDS: Record<HeroDay, string> = { full: "full check-in", partial: "partial", missed: "missed", today: "not logged yet", ahead: "ahead" };

/** "Fri 6 Nov" */
const dayLabel = (iso: string) => `${new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`))} ${shortDate(iso)}`;

/**
 * Winter Arc at a glance (dark hero): Day N / 90, the streak with a small flame, and 90 round
 * dots (30 a row, 15 on phones): full check-in filled, partial half-filled, today with a pulsing
 * ring. Hover, drag or arrow keys across the dots: the line under them reads that day.
 * On the Winter Arc page itself (`onPage`) the heading isn't a link.
 */
export function HeroTile({ onPage = false }: { onPage?: boolean }) {
  const { data, checkedIn } = useDashboard();
  const hero = data.hero;
  const href = onPage ? undefined : viewHref(data.basePath, "arc");
  const [picked, setPicked] = useState<number | null>(null);
  if (!hero) {
    return (
      <Tile title="Winter Arc" href={href} tone="hero" area={onPage ? undefined : "hero"} tilt={!onPage}>
        <p className="m-0 text-sm text-hero-soft">Set the start date in Settings to begin the 90 days.</p>
      </Tile>
    );
  }
  const started = hero.day >= 1;
  // A save from the Overview turns today's empty dot into a partial one straight away.
  const days = hero.days.map((d) => (d === "today" && checkedIn ? "partial" : d));
  const streak = hero.streak + (checkedIn && hero.days[hero.todayIndex] === "today" ? 1 : 0);
  const shown = picked ?? (hero.todayIndex >= 0 ? hero.todayIndex : started ? hero.length - 1 : 0);
  const readout = `Day ${shown + 1} · ${dayLabel(addDays(hero.start, shown))} · ${WORDS[days[shown]]}`;

  const pickAt = (e: PointerEvent<HTMLOListElement>) => {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    const i = target instanceof HTMLElement ? target.dataset.i : undefined;
    if (i !== undefined) setPicked(Number(i));
  };
  const onKey = (e: KeyboardEvent<HTMLOListElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 15, ArrowUp: -15, Home: -999, End: 999 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    setPicked(Math.min(hero.length - 1, Math.max(0, shown + step)));
  };

  return (
    <Tile
      title="Winter Arc"
      href={href}
      tone="hero"
      area={onPage ? undefined : "hero"}
      tilt={!onPage}
      className="min-h-[300px] min-[561px]:min-h-0"
      aside={
        streak > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">
            <span aria-hidden="true" className="inline-block origin-bottom animate-flame">
              🔥
            </span>
            {streak} day streak
          </span>
        )
      }
    >
      <p className="display m-0 text-[44px] leading-none sm:text-[56px]">
        {started ? (
          <>
            Day {hero.day} <span className="text-[24px] text-hero-soft sm:text-[28px]">/ {hero.length}</span>
          </>
        ) : (
          <>
            Starts in {hero.startsIn} {hero.startsIn === 1 ? "day" : "days"}
          </>
        )}
      </p>
      <div className="mt-auto flex flex-col gap-2">
        <ol
          tabIndex={0}
          aria-label={`${hero.checkIns} of ${hero.length} days checked in. Arrow keys read each day.`}
          onPointerMove={pickAt}
          onPointerDown={pickAt}
          onPointerLeave={() => setPicked(null)}
          onKeyDown={onKey}
          onBlur={() => setPicked(null)}
          className="m-0 grid touch-pan-y list-none grid-cols-[repeat(15,minmax(0,1fr))] gap-[5px] rounded-item p-0 min-[561px]:grid-cols-[repeat(30,minmax(0,1fr))]"
        >
          {days.map((d, i) => (
            <li
              key={i}
              data-i={i}
              aria-hidden="true"
              className={`aspect-square rounded-full ${DOT[d]} ${i === hero.todayIndex ? "animate-pulse-ring outline-2 outline-offset-1 outline-dot-on" : ""} ${i === picked ? "scale-125" : ""} transition-transform`}
            />
          ))}
        </ol>
        <p aria-live="polite" className="m-0 font-mono text-xs font-bold text-hero-soft">
          {readout}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-hero-soft">
          <span className="flex flex-wrap gap-3">
            <Legend className={DOT.full} label="Full" />
            <Legend className={DOT.partial} label="Partial" />
            <Legend className={DOT.missed} label="Missed" />
          </span>
          <span className="font-semibold text-white">
            {hero.daysLeft} {hero.daysLeft === 1 ? "day" : "days"} to {hero.finishLabel}
          </span>
        </div>
      </div>
    </Tile>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span aria-hidden="true" className={`size-2.5 rounded-full ${className}`} />
      {label}
    </span>
  );
}
