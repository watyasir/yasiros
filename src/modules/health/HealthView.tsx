"use client";

import Link from "next/link";
import { useState } from "react";
import { Chip } from "@/components/Chip";
import { EmptyNote } from "@/components/EmptyNote";
import { changeWords, LineChart } from "@/components/LineChart";
import { Segmented } from "@/components/Segmented";
import { BigNumber, Tile, type TileTone } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { addDays } from "@/lib/trackers";
import type { Point } from "@/modules/types";
import { HeroTile } from "@/modules/overview/HeroTile";
import { MealsTile } from "./MealsTile";
import { WorkoutsTile } from "./WorkoutsTile";

const RANGES = [7, 30, 90] as const;

/**
 * Health: the Winter Arc hero, then weight, sleep and workouts in a row, then meals (two columns)
 * and blood pressure. The 7D / 30D / 90D control sets the weight and sleep charts.
 */
export function HealthView() {
  const { data } = useDashboard();
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const within = (points: Point[]) => points.filter((p) => p.date > addDays(data.todayISO, -days));
  const { bodyCheck, bodyHref } = data;

  return (
    <div className="grid gap-4 min-[861px]:grid-cols-3">
      <div className="min-w-0 min-[861px]:col-span-3">
        <HeroTile />
      </div>
      <div className="w-full max-w-xs min-[861px]:col-span-3">
        <Segmented label="Chart range" options={RANGES.map((d) => ({ value: d, label: `${d}D`, ariaLabel: `${d} days` }))} value={days} onChange={setDays} />
      </div>
      <TrendTile
        title="Weight"
        tone="weight"
        points={within(data.weight.points)}
        unit="kg"
        days={days}
        empty="Log your weight on 2 days to see the trend."
        aside={
          bodyCheck.due && (
            <Link href={bodyHref} className="-my-2 inline-flex min-h-11 items-center no-underline">
              <Chip tone="warn">Body check due</Chip>
            </Link>
          )
        }
      />
      <TrendTile title="Sleep" tone="study" points={within(data.sleep)} unit="hr" days={days} empty="Log lights out and wake time (or sleep hours) on 2 days." />
      <WorkoutsTile />
      <div className="min-w-0 min-[861px]:col-span-2">
        <MealsTile />
      </div>
      <BpTile />
    </div>
  );
}

function TrendTile({
  title,
  tone,
  points,
  unit,
  days,
  empty,
  aside,
}: {
  title: string;
  tone: TileTone;
  points: Point[];
  unit: string;
  days: number;
  empty: string;
  aside?: React.ReactNode;
}) {
  if (points.length < 2) {
    return (
      <Tile title={title} tone={tone} aside={aside}>
        <EmptyNote>{empty}</EmptyNote>
      </Tile>
    );
  }
  const latest = points.at(-1)!.value;
  const change = changeWords(points, unit, 1);
  return (
    <Tile title={title} tone={tone} aside={aside}>
      <div className="flex flex-col gap-1">
        <BigNumber value={latest.toLocaleString("en-IN", { maximumFractionDigits: 1 })} unit={unit} size="md" />
        <span className="text-xs font-semibold text-soft">{change}</span>
      </div>
      <LineChart points={points} unit={unit} digits={1} height={110} summary={`${title} ${change} over ${days} days, latest ${latest} ${unit}`} />
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
