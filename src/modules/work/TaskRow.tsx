"use client";

import { Chip } from "@/components/Chip";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import type { Task } from "@/lib/tasks";
import { DueLabel } from "./DueLabel";
import { OwnerChip } from "./OwnerChip";
import { TICK_CLASS, useTick } from "./useTick";

/**
 * One open task on a Work card: a round tick (it leaves the card at once, with confetti and an
 * Undo toast) and the title, which opens the task sheet to edit.
 */
export function TaskRow({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const { data } = useDashboard();
  const tick = useTick();
  return (
    <li className="flex items-center gap-1 rounded-item bg-card/70 py-0.5 pr-1 pl-1">
      <button type="button" onClick={(e) => tick(task, e.currentTarget)} aria-label={`Mark done: ${task.title}`} className={TICK_CLASS}>
        <span aria-hidden="true" className="grid size-6 place-items-center rounded-full border-2 border-ink text-xs font-bold text-transparent group-hover:text-ink">
          ✓
        </span>
      </button>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${task.title}. Edit`}
        className="flex min-h-11 min-w-0 flex-1 cursor-pointer flex-col justify-center gap-1 rounded-item border-0 bg-transparent px-1 py-1.5 text-left text-ink"
      >
        <span className="line-clamp-2 text-sm leading-snug font-semibold">{task.title}</span>
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <OwnerChip owner={task.owner} />
          {task.status !== "todo" && <Chip tone="accent">{task.status === "doing" ? "In progress" : "Waiting"}</Chip>}
          <DueLabel task={task} today={data.todayISO} />
        </span>
      </button>
    </li>
  );
}
