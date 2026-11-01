"use client";

import Link from "next/link";
import { useState } from "react";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { viewHref } from "@/components/dashboard/Nav";
import type { Task } from "@/lib/tasks";
import { DueChip } from "@/modules/work/DueChip";
import { OwnerChip } from "@/modules/work/OwnerChip";
import { useTick } from "@/modules/work/useTick";

const SLIDE_MS = 280;

/**
 * The next 3 open tasks: overdue first, then by due date, then importance. The round button ticks
 * one off (moved to Done): the row slides out of the list at once (no strikethrough), a small
 * confetti burst, and a toast with Undo (which reopens it where it was).
 */
export function NextUpTile() {
  const { data, tasks } = useDashboard();
  const tickTask = useTick();
  const [leaving, setLeaving] = useState<string[]>([]);
  const today = data.todayISO;
  const open = tasks.filter((t) => t.status !== "done");
  const next = [...open]
    .sort((a, b) => Number(!overdue(a, today)) - Number(!overdue(b, today)) || (a.due ?? "9999").localeCompare(b.due ?? "9999") || b.order - a.order)
    .slice(0, 3);
  const workHref = viewHref(data.basePath, "work");

  const tick = (t: Task, button: HTMLElement) => {
    if (leaving.includes(t.id)) return;
    setLeaving((l) => [...l, t.id]);
    tickTask(t, button, SLIDE_MS);
    setTimeout(() => setLeaving((l) => l.filter((id) => id !== t.id)), SLIDE_MS + 50);
  };

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
          {next.map((t) => {
            const gone = leaving.includes(t.id);
            return (
              <li
                key={t.id}
                className={`flex items-center gap-2 rounded-item bg-card/70 py-1 pr-3 pl-1 transition-[transform,opacity] duration-300 ${gone ? "translate-x-8 opacity-0" : ""}`}
              >
                <button
                  type="button"
                  onClick={(e) => tick(t, e.currentTarget)}
                  disabled={gone}
                  aria-label={`Mark done: ${t.title}`}
                  className="press group grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent"
                >
                  <span
                    aria-hidden="true"
                    className={`grid size-6 place-items-center rounded-full border-2 border-ink text-xs font-bold ${gone ? "bg-ink text-white" : "text-transparent group-hover:text-ink"}`}
                  >
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
            );
          })}
        </ul>
      )}
    </Tile>
  );
}

const overdue = (t: Task, today: string) => t.due != null && t.due < today;
