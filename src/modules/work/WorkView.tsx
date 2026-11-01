"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { EmptyNote } from "@/components/EmptyNote";
import { PillLink } from "@/components/PillLink";
import { Segmented } from "@/components/Segmented";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import type { Task } from "@/lib/tasks";
import type { TileTone } from "@/components/Tile";
import { GoalCard } from "./GoalCard";
import { TaskSheet, type SheetTarget } from "./TaskSheet";

type Filter = "active" | "done" | "all";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "done", label: "Done" },
  { value: "all", label: "All" },
];

// A different soft colour per card, round and round.
const TONES: TileTone[] = ["tasks", "study", "fund", "today", "money", "weight", "diet"];

/**
 * Work: a grid of goal cards (3 across, 2 under 1100px, 1 under 700px, same height per row), then
 * the loose tasks (no goal) as the last card. Active / Done / All filters the goals by progress.
 * Before the goal_id migration has run every task is loose.
 */
export function WorkView() {
  const { data, tasks, taskError } = useDashboard();
  const [filter, setFilter] = useState<Filter>("active");
  const [sheet, setSheet] = useState<SheetTarget | null>(null);
  const open = (t: Task) => setSheet({ task: t, status: t.status });

  const goals = data.goals.filter((g) => (filter === "all" ? true : filter === "done" ? g.pct >= 100 : g.pct < 100));
  const known = new Set(data.goals.map((g) => g.id));
  const loose = tasks.filter((t) => !t.goalId || !known.has(t.goalId));

  return (
    <div className="flex flex-col gap-4">
      {taskError && (
        <p role="alert" className="m-0 rounded-2xl bg-danger-soft px-4 py-3 text-[13px] text-danger">
          {taskError}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-xs">
          <Segmented label="Show goals" options={FILTERS} value={filter} onChange={setFilter} />
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <PillLink href={data.goalsHref}>Goals</PillLink>
          <Button variant="primary" onClick={() => setSheet({ status: "todo" })}>
            Add task
          </Button>
        </div>
      </div>
      {goals.length === 0 && filter !== "active" && <EmptyNote>{filter === "done" ? "No finished goals yet." : "No goals yet. Add one from Goals."}</EmptyNote>}
      <div className="grid grid-cols-3 items-stretch gap-4 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1">
        {goals.map((g, i) => (
          <GoalCard key={g.id} goal={g} tasks={tasks.filter((t) => t.goalId === g.id)} tone={TONES[i % TONES.length]} onOpen={open} />
        ))}
        {filter !== "done" && <GoalCard goal={null} tasks={loose} tone="card" onOpen={open} />}
      </div>
      {sheet && <TaskSheet target={sheet} onClose={() => setSheet(null)} />}
    </div>
  );
}
