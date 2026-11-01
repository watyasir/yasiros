"use client";

import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useToast } from "@/components/Toast";
import { centreOf, useConfetti } from "@/components/useConfetti";
import type { Task } from "@/lib/tasks";

/**
 * Ticking a task off (Overview "Next up" and the Work cards): it leaves the list at once, a small
 * confetti burst, and a toast "Nice. N left." whose Undo puts it back where it was.
 */
export function useTick() {
  const { tasks, moveTask } = useDashboard();
  const toast = useToast();
  const confetti = useConfetti();
  return (task: Task, button: HTMLElement) => {
    const before = task.status;
    confetti({ count: 40, from: centreOf(button) });
    moveTask(task.id, "done");
    const left = tasks.filter((t) => t.status !== "done" && t.id !== task.id).length;
    toast({ text: left === 0 ? "Nice. All clear." : `Nice. ${left} left.`, undo: () => moveTask(task.id, before) });
  };
}

/** The round 44px tick button used by both lists. */
export const TICK_CLASS = "press group grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent";
