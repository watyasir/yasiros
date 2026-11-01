"use client";

import Link from "next/link";
import { Chip } from "@/components/Chip";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";
import { workOrder, type Task } from "@/lib/tasks";
import { shortDate } from "@/lib/trackers";
import { OwnerChip } from "@/modules/work/OwnerChip";
import { TICK_CLASS, useTick } from "@/modules/work/useTick";

/**
 * The next 3 open tasks: overdue first, then by due date. The round button ticks one off: it
 * leaves the list at once (no strike-through), confetti, and a toast with Undo (useTick).
 */
export function NextUpTile() {
  const { data, tasks } = useDashboard();
  const tick = useTick();
  const today = data.todayISO;
  const open = tasks.filter((t) => t.status !== "done");
  const next = [...open].sort(workOrder(today)).slice(0, 3);
  const workHref = viewHref(data.basePath, "work");

  return (
    <Tile title="Next up" href={workHref} tone="tasks" area="tasks" tilt aside={open.length > 0 && <span className="label text-soft">{open.length} open</span>}>
      {next.length === 0 ? (
        <div className="flex flex-1 flex-col justify-center gap-2">
          <p className="display m-0 text-[28px]">All clear.</p>
          <Link href={workHref} prefetch className="flex min-h-11 items-center text-sm font-semibold text-accent">
            Open Work →
          </Link>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {next.map((t) => (
            <li key={t.id} className="flex items-center gap-2 rounded-item bg-card/70 py-1 pr-3 pl-1">
              <button type="button" onClick={(e) => tick(t, e.currentTarget)} aria-label={`Mark done: ${t.title}`} className={TICK_CLASS}>
                <span aria-hidden="true" className="grid size-6 place-items-center rounded-full border-2 border-ink text-xs font-bold text-transparent group-hover:text-ink">
                  ✓
                </span>
              </button>
              <span className="flex min-w-0 flex-1 flex-col gap-1 py-1.5">
                <span className="line-clamp-2 text-sm leading-snug font-semibold">{t.title}</span>
                <span className="flex flex-wrap items-center gap-1.5">
                  <OwnerChip owner={t.owner} />
                  <DueChip task={t} today={today} />
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Tile>
  );
}

/** "! Overdue", "Today" or the date: words, not colour alone. */
function DueChip({ task, today }: { task: Task; today: string }) {
  if (!task.due) return null;
  if (task.due < today) return <Chip tone="danger">! Overdue</Chip>;
  if (task.due === today) return <Chip tone="warn">Today</Chip>;
  return <Chip>{shortDate(task.due)}</Chip>;
}
