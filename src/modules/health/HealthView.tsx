"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { EmptyNote } from "@/components/EmptyNote";
import { changeWords, LineChart } from "@/components/LineChart";
import { Segmented } from "@/components/Segmented";
import { BigNumber, Tile, type TileTone } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { addDays } from "@/lib/trackers";
import type { Point } from "@/modules/types";
import { Chip } from "@/components/Chip";
import { HeroTile } from "./HeroTile";
import { WorkoutsTile } from "./WorkoutsTile";

const RANGES = [7, 30, 90] as const;

/**
 * Health (v10): the Winter Arc hero across the top; Weight (with "Body check due"), Sleep and
 * Workouts in a row; then today's Meals (2 columns) and Blood pressure. One 7D / 30D / 90D switch
 * for both charts.
 */
export function HealthView() {
  const { data } = useDashboard();
  const [days, setDays] = useState<(typeof RANGES)[number]>(7);
  const within = (points: Point[]) => points.filter((p) => p.date > addDays(data.todayISO, -days));
  const bodyDue = data.bodyCheck.due && data.bodyCheck.lastLabel != null;

  return (
    <div className="flex flex-col gap-4">
      <HeroTile />
      <div className="w-full max-w-xs">
        <Segmented label="Chart range" options={RANGES.map((d) => ({ value: d, label: `${d}D` }))} value={days} onChange={setDays} />
      </div>
      <div className="grid items-start gap-4 min-[861px]:grid-cols-3">
        <TrendTile
          title="Weight"
          tone="weight"
          points={within(data.weight.points)}
          unit="kg"
          days={days}
          empty="Log your weight on 2 days to see the trend."
          chip={bodyDue ? <Chip tone="warn">Body check due</Chip> : undefined}
          footer={
            <Link href={data.bodyHref} prefetch className="flex min-h-11 items-center self-start text-sm font-semibold text-accent no-underline hover:underline">
              Weekly body check →
            </Link>
          }
        />
        <TrendTile title="Sleep" tone="study" points={within(data.sleep)} unit="hr" days={days} empty="Log lights out and wake time (or sleep hours) on 2 days." />
        <WorkoutsTile />
      </div>
      <div className="grid items-start gap-4 min-[861px]:grid-cols-3">
        <div className="min-w-0 min-[861px]:col-span-2">
          <MealsTile />
        </div>
        <BpTile />
      </div>
    </div>
  );
}

const MEAL_CHIP: Record<string, { tone: "ok" | "warn" | "danger"; mark: string }> = {
  Planned: { tone: "ok", mark: "✓" },
  Swapped: { tone: "warn", mark: "~" },
  Skipped: { tone: "danger", mark: "✕" },
};

/** Today's 7 meal slots with what was logged: planned, swapped or skipped (set in the check-in). */
function MealsTile() {
  const { data } = useDashboard();
  const planned = data.meals.filter((m) => m.status === "Planned").length;
  return (
    <Tile title="Meals" href={data.logHref} tone="diet" aside={data.meals.length > 0 && <span className="label">{planned}/{data.meals.length} planned</span>}>
      {data.meals.length === 0 ? (
        <EmptyNote>Meal slots appear once the check-in has them.</EmptyNote>
      ) : (
        <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0">
          {data.meals.map((m) => {
            const c = m.status ? MEAL_CHIP[m.status] : undefined;
            return (
              <li key={m.name} className="flex min-h-11 items-center justify-between gap-2 rounded-item bg-card/70 px-3 text-sm">
                <span className="min-w-0 truncate font-semibold">{m.name}</span>
                {c ? (
                  <Chip tone={c.tone}>
                    {c.mark} {m.status}
                  </Chip>
                ) : (
                  <Chip>Not logged</Chip>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Tile>
  );
}

function TrendTile({
  title,
  tone,
  points,
  unit,
  days,
  empty,
  digits = 1,
  chip,
  footer,
}: {
  title: string;
  tone: TileTone;
  points: Point[];
  unit: string;
  days: number;
  empty: string;
  digits?: number;
  /** In the heading, beside the change (e.g. "Body check due"). */
  chip?: ReactNode;
  footer?: ReactNode;
}) {
  if (points.length < 2) {
    return (
      <Tile title={title} tone={tone} aside={chip}>
        <EmptyNote>{empty}</EmptyNote>
        {footer}
      </Tile>
    );
  }
  const latest = points.at(-1)!.value;
  const change = changeWords(points, unit, digits);
  return (
    <Tile
      title={title}
      tone={tone}
      aside={
        <span className="flex items-center gap-2">
          {chip}
          <span className="text-xs text-soft">{change}</span>
        </span>
      }
    >
      <BigNumber value={latest.toLocaleString("en-IN", { maximumFractionDigits: digits })} unit={unit} size="md" />
      <LineChart points={points} unit={unit} digits={digits} height={110} summary={`${title} ${change} over ${days} days, latest ${latest} ${unit}`} />
      {footer}
    </Tile>
  );
}

function BpTile() {
  const { bp } = useDashboard().data;
  const any = bp.some((r) => r.value);
  return (
    <Tile title="Blood pressure" aside={<span className="text-xs text-soft">today · mmHg</span>}>
      {!any && <EmptyNote>Log morning and evening readings in the check-in.</EmptyNote>}
      {any && (
        <dl className="m-0 grid grid-cols-2 gap-2">
          {bp.map((r) => (
            <div key={r.label} className="flex flex-col rounded-item border border-line bg-fill p-3">
              <dt className="text-xs text-soft">{r.label}</dt>
              <dd className="m-0 font-mono text-xl font-bold">{r.value ?? "–"}</dd>
            </div>
          ))}
        </dl>
      )}
    </Tile>
  );
}
