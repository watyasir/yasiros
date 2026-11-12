"use client";

import { useState } from "react";
import { demoTrackers } from "@/data/demo/checkin";
import { demoGoals } from "@/data/demo/goals";
import { canSum, formatAmount } from "@/lib/trackers";
import type { Goal } from "@/lib/tasks";
import { GoalsForm, type GoalRow } from "./GoalsForm";

/* /demo version of the goals page: same screen, changes stay on the page. */

const linkable = demoTrackers.filter(canSum).map(({ id, name, type, unit }) => ({ id, name, type, unit }));

const toRow = (goal: Goal): GoalRow => {
  const tracker = linkable.find((t) => t.id === goal.trackerId);
  const unit = tracker ? (tracker.type === "duration_minutes" ? "hr" : tracker.type === "checkbox" ? "days" : tracker.unit) : goal.unit;
  return {
    goal,
    progress: `${formatAmount(goal.current)} of ${formatAmount(goal.target)}${unit ? ` ${unit}` : ""}`,
    trackerName: tracker?.name ?? null,
  };
};

const wait = () => new Promise((resolve) => setTimeout(resolve, 300));

export function DemoGoalsForm() {
  const [goals, setGoals] = useState(demoGoals);
  return (
    <GoalsForm
      rows={goals.map(toRow)}
      trackers={linkable}
      backHref="/demo"
      actions={{
        add: async (g) => {
          await wait();
          setGoals((all) => [
            ...all,
            { id: `g${Date.now()}`, title: g.title.trim(), area: g.area, target: g.target ?? 1, unit: g.unit || null, deadline: g.deadline, start: null, trackerId: g.trackerId, current: 0 },
          ]);
          return { ok: true };
        },
        update: async (id, current) => {
          await wait();
          setGoals((all) => all.map((g) => (g.id === id ? { ...g, current } : g)));
          return { ok: true };
        },
        remove: async (id) => {
          await wait();
          setGoals((all) => all.filter((g) => g.id !== id));
          return { ok: true };
        },
      }}
      footer={<p className="m-0 mx-4 text-[13px] text-soft">Demo: nothing is saved. The real page stores goals in the database.</p>}
    />
  );
}
