"use client";

import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useToast } from "@/components/Toast";
import { centreOf, useConfetti } from "@/components/useConfetti";
import { openTasks, type Task } from "@/lib/tasks";

/**
 * Ticking a task off (Overview's Next up and the Work cards): it moves to Done, so it leaves the
 * list straight away; a small confetti burst from the tick; a toast "Nice. N left." whose Undo
 * puts it back as it was. `delay` lets a row slide out first.
 */
export function useTick() {
  const { data, tasks, moveTask } = useDashboard();
  const toast = useToast();
  const confetti = useConfetti();
  return (task: Task, button: HTMLElement, delay = 0) => {
    const before = task.status;
    confetti({ count: 40, from: centreOf(button) });
    const done = () => {
      moveTask(task.id, "done");
      const left = openTasks(tasks, data.goals, data.todayISO).filter((t) => t.id !== task.id).length;
      toast({ text: left === 0 ? "Nice. All clear." : `Nice. ${left} left.`, undo: () => moveTask(task.id, before) });
    };
    if (delay && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setTimeout(done, delay);
    else done();
  };
}
