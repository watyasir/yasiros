"use client";

import { useState } from "react";
import { EmptyNote } from "@/components/EmptyNote";
import { ProgressBar } from "@/components/ProgressBar";
import { Tile, type TileTone } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { workOrder, type Task } from "@/lib/tasks";
import type { DashboardData } from "@/modules/types";
import { TaskRow } from "./TaskRow";

/** How many open tasks a card shows before "Show all". */
const SHOWN = 3;

type Goal = DashboardData["goals"][number];

/**
 * One card: a goal (label "<area> · by <deadline>", name, % done, bar) or the loose tasks (no goal).
 * Under it "x of y tasks done" and the first 3 open tasks; done tasks are gone. "Show all N" opens
 * the rest, "Show less" folds them again (only when there are more than 3).
 */
export function GoalCard({ goal, tasks, tone, onOpen }: { goal: Goal | null; tasks: Task[]; tone: TileTone; onOpen: (t: Task) => void }) {
  const { data } = useDashboard();
  const [all, setAll] = useState(false);
  const open = tasks.filter((t) => t.status !== "done").sort(workOrder(data.todayISO));
  const done = tasks.length - open.length;
  const shown = all ? open : open.slice(0, SHOWN);
  const label = goal ? `${goal.area || "Goal"} · ${goal.by}` : "Loose tasks";

  return (
    <Tile title={label} tone={tone} className="h-full">
      {goal && (
        <>
          <h3 className="display m-0 text-[22px] leading-tight text-balance">{goal.name}</h3>
          <div className="flex items-baseline gap-2">
            <span className="display text-[32px] leading-none">{goal.pct}%</span>
            <span className="text-xs font-semibold text-soft">done · {goal.progress}</span>
          </div>
          <ProgressBar pct={goal.pct} tone="accent" label={`${goal.name}: ${goal.pct}%`} />
        </>
      )}
      <p className="m-0 text-xs font-semibold text-soft">
        {tasks.length === 0 ? "No tasks yet" : `${done} of ${tasks.length} tasks done`}
      </p>
      {open.length === 0 ? (
        <EmptyNote>{tasks.length === 0 ? (goal ? "Link tasks to this goal from a task's edit sheet." : "Nothing loose. Add a task.") : "No open tasks."}</EmptyNote>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
          {shown.map((t) => (
            <TaskRow key={t.id} task={t} onOpen={() => onOpen(t)} />
          ))}
        </ul>
      )}
      {open.length > SHOWN && (
        <button
          type="button"
          onClick={() => setAll((a) => !a)}
          aria-expanded={all}
          className="press mt-auto min-h-11 cursor-pointer rounded-full border-0 bg-white/60 px-4 text-sm font-semibold text-ink"
        >
          {all ? "Show less" : `Show all ${open.length}`}
        </button>
      )}
    </Tile>
  );
}
