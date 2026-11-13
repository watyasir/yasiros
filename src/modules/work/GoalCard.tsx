"use client";

import { useState } from "react";
import { Chip } from "@/components/Chip";
import { ProgressBar } from "@/components/ProgressBar";
import { Tile, type TileTone } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import type { Task } from "@/lib/tasks";
import { shortDate } from "@/lib/trackers";
import { DueChip } from "./DueChip";
import { useTick } from "./useTick";

const SHOWN = 3;

export interface CardModel {
  key: string;
  /** "Exams · by 21 Nov" */
  meta: string;
  name: string;
  /** null = the Loose tasks card. */
  goalId: string | null;
  tasks: Task[];
  /** Open tasks (not done, not on hold, openTasks): they add up to the Work tab's number. */
  open: Task[];
  /** Open tasks that haven't started (their own start date, or the goal's), with that date. */
  held: { task: Task; start: string }[];
  /** The goal's start date while it's on hold, else null. */
  start: string | null;
  /** % done: done tasks of all, or the goal's own progress while it has no tasks. */
  pct: number;
  tone: TileTone;
}

/**
 * One goal on the Work page: area and deadline, the name, % done with a bar, "x of y tasks done",
 * and the first 3 open tasks ("Show all N" for more). Tick = the task leaves the list (Done),
 * confetti and an Undo toast. Tap a title to edit it in the task sheet. On-hold tasks sit at the
 * bottom as small grey rows with a "Starts" chip (no tick). An on-hold goal is a small grey card
 * (title and "Starts" chip) until its start date; tapping it opens the full card.
 */
export function GoalCard({ card, onOpen, onAdd }: { card: CardModel; onOpen: (t: Task) => void; onAdd: (goalId: string | null) => void }) {
  const { data } = useDashboard();
  const tick = useTick();
  const [all, setAll] = useState(false);
  const [opened, setOpened] = useState(false);
  const open = [...card.open].sort(byDue);
  const done = card.tasks.filter((t) => t.status === "done").length;
  const shown = all ? open : open.slice(0, SHOWN);

  if (card.start && !opened) {
    return (
      <Tile title={card.meta} tone={card.tone} className="self-start opacity-55 grayscale">
        <button
          type="button"
          onClick={() => setOpened(true)}
          aria-label={`${card.name}, on hold, starts ${shortDate(card.start)}. Open`}
          className="press -m-1 flex min-h-11 cursor-pointer items-center gap-2 rounded-item border-0 bg-transparent p-1 text-left text-ink"
        >
          <span className="display min-w-0 flex-1 text-lg leading-tight">{card.name}</span>
          <Chip>Starts {shortDate(card.start)}</Chip>
        </button>
      </Tile>
    );
  }

  return (
    <Tile title={card.meta} tone={card.tone} className="h-full" aside={card.start && <Chip>Starts {shortDate(card.start)}</Chip>}>
      <div className="flex flex-col gap-2">
        <h3 className="display m-0 text-2xl leading-tight">{card.name}</h3>
        <div className="flex items-center gap-3">
          <span className="display text-xl">{card.pct}%</span>
          <div className="min-w-0 flex-1">
            <ProgressBar pct={card.pct} tone={card.pct >= 100 ? "ok" : "accent"} label={`${card.name}: ${card.pct}% done`} />
          </div>
        </div>
        <span className="text-xs font-semibold text-soft">
          {card.tasks.length ? `${done} of ${card.tasks.length} tasks done${open.length ? ` · ${open.length} open` : ""}` : "No tasks yet"}
        </span>
      </div>
      {open.length === 0 && card.held.length === 0 && card.tasks.length > 0 && <p className="m-0 text-sm font-semibold">All done ✓</p>}
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {shown.map((t) => (
          <li key={t.id} className="flex items-center gap-1 rounded-item bg-card/70 pr-2">
            <button
              type="button"
              onClick={(e) => tick(t, e.currentTarget)}
              aria-label={`Mark done: ${t.title}`}
              className="press group grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent"
            >
              <span aria-hidden="true" className="grid size-6 place-items-center rounded-full border-2 border-ink text-xs font-bold text-transparent group-hover:text-ink">
                ✓
              </span>
            </button>
            <button
              type="button"
              onClick={() => onOpen(t)}
              className="press flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left text-sm font-semibold text-ink"
            >
              <span className="min-w-0 flex-1 truncate">{t.title}</span>
              <DueChip task={t} today={data.todayISO} />
            </button>
          </li>
        ))}
        {card.held.map(({ task: t, start }) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => onOpen(t)}
              aria-label={`${t.title}, on hold, starts ${shortDate(start)}. Edit`}
              className="press flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-item border-0 bg-card/40 py-0 pl-3 pr-2 text-left text-xs font-semibold text-soft"
            >
              <span className="min-w-0 flex-1 truncate">{t.title}</span>
              <Chip>Starts {shortDate(start)}</Chip>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap items-center gap-x-4">
        {open.length > SHOWN && (
          <button type="button" onClick={() => setAll((a) => !a)} className="press min-h-11 cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-accent">
            {all ? "Show less" : `Show all ${open.length}`}
          </button>
        )}
        <button type="button" onClick={() => onAdd(card.goalId)} className="press min-h-11 cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-accent">
          + Add task
        </button>
      </div>
    </Tile>
  );
}

const byDue = (a: Task, b: Task) => (a.due ?? "9999").localeCompare(b.due ?? "9999") || b.order - a.order;
