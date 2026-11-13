"use client";

import { useState } from "react";
import { EmptyNote } from "@/components/EmptyNote";
import { Segmented } from "@/components/Segmented";
import { Tile, type TileTone } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { shortDate } from "@/lib/trackers";
import { byGoal, heldTasks, notStarted, openTasks, type Task } from "@/lib/tasks";
import { GoalCard, type CardModel } from "./GoalCard";
import { TaskSheet, type SheetTarget } from "./TaskSheet";

const TONES: TileTone[] = ["tasks", "money", "today", "weight", "fund", "diet", "study"];
type Filter = "active" | "done" | "all";

/**
 * Work (v10, replaces the Board): one card per goal with its tasks, 3 columns on a laptop, 2 from
 * 1100px, 1 from 700px, cards in a row the same height. Tasks with no goal (or before the
 * task-goals migration, every task) go in a last "Loose tasks" card. Active / Done / All filter.
 * On-hold goals (start date still ahead, in India) sit after the rest as small grey cards.
 */
export function WorkView() {
  const { data, tasks, taskError } = useDashboard();
  const [filter, setFilter] = useState<Filter>("active");
  const [sheet, setSheet] = useState<SheetTarget | null>(null);

  const today = data.todayISO;
  const held = heldTasks(tasks, data.goals, today);
  // An on-hold task's chip shows its own start date, or else its goal's.
  const goalStart = new Map(data.goals.map((g) => [g.id, g.start]));
  const startOf = (t: Task) => (notStarted(t.start, today) ? t.start! : goalStart.get(t.goalId ?? "")!);
  const split = (list: Task[]) => ({
    tasks: list,
    open: openTasks(list, data.goals, today),
    held: list.filter((t) => held.has(t.id) && t.status !== "done").map((t) => ({ task: t, start: startOf(t) })),
  });
  const groups = byGoal(tasks, data.goals.map((g) => g.id));
  const cards: CardModel[] = data.goals.map((g, i) => {
    const own = groups[i].tasks;
    return {
      key: g.id,
      meta: `${g.area || "Goal"} · ${g.deadline ? `by ${shortDate(g.deadline)}` : "no deadline"}`,
      name: g.name,
      goalId: g.id,
      ...split(own),
      start: notStarted(g.start, today) ? g.start : null,
      pct: own.length ? pctDone(own) : g.pct,
      tone: TONES[i % TONES.length],
    };
  });
  const loose = groups[data.goals.length]?.tasks;
  if (loose) cards.push({ key: "loose", meta: "No goal", name: "Loose tasks", goalId: null, ...split(loose), start: null, pct: pctDone(loose), tone: "card" });
  // On-hold goals go after the active ones (stable: each group keeps its deadline order).
  cards.sort((a, b) => Number(!!a.start) - Number(!!b.start));

  const finished = (c: CardModel) => (c.tasks.length ? c.tasks.every((t) => t.status === "done") : c.pct >= 100);
  const shown = cards.filter((c) => filter === "all" || (filter === "done" ? finished(c) : !finished(c)));

  return (
    <div className="flex flex-col gap-4">
      {taskError && (
        <p role="alert" className="m-0 rounded-item bg-danger-soft px-4 py-3 text-sm text-danger">
          {taskError}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-xs">
          <Segmented
            label="Show"
            options={[
              { value: "active", label: "Active" },
              { value: "done", label: "Done" },
              { value: "all", label: "All" },
            ]}
            value={filter}
            onChange={(f) => setFilter(f as Filter)}
          />
        </div>
        <button
          type="button"
          onClick={() => setSheet({ status: "todo", goalId: null })}
          className="press ml-auto min-h-11 cursor-pointer rounded-full border-0 bg-pop px-5 text-sm font-semibold text-ink hover:bg-pop-strong"
        >
          + Add task
        </button>
      </div>
      {shown.length === 0 ? (
        <Tile title="Work">
          <EmptyNote>{filter === "done" ? "Nothing finished yet." : "Nothing open. Add a goal in Goals, or a task here."}</EmptyNote>
        </Tile>
      ) : (
        <div className="grid grid-cols-1 items-stretch gap-4 min-[701px]:grid-cols-2 min-[1101px]:grid-cols-3">
          {shown.map((c) => (
            <GoalCard key={c.key} card={c} onOpen={(task) => setSheet({ task, status: task.status })} onAdd={(goalId) => setSheet({ status: "todo", goalId })} />
          ))}
        </div>
      )}
      {sheet && <TaskSheet target={sheet} onClose={() => setSheet(null)} />}
    </div>
  );
}

function pctDone(list: Task[]): number {
  return list.length ? Math.round((list.filter((t) => t.status === "done").length / list.length) * 100) : 0;
}
