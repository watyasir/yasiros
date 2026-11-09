"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { sectionLabel, sectionTrackers, type SectionKey } from "@/lib/checkin-sections";
import type { CheckInValues, Tracker } from "@/lib/trackers";
import { TrackerRows } from "./TrackerRows";

/**
 * One check-in section in a sheet (v10.2), from the Today card or /log: only that section's rows,
 * Cancel and Save. Save hands back only this section's values; the caller saves them (optimistic,
 * with rollback) and closes the sheet. Escape and the backdrop close it; focus goes to the first
 * control and back to where it came from. Rendered on <body>, so a tilting tile can't trap it.
 */
export function SectionSheet({
  section,
  trackers,
  initialValues,
  dayLabel,
  workoutHref,
  footer,
  onSave,
  onClose,
}: {
  section: SectionKey;
  trackers: Tracker[];
  initialValues: CheckInValues;
  dayLabel: string;
  /** Workout only: the "Log a workout" link. */
  workoutHref?: string;
  /** More only: the longer logs (workout, weekly body check, season and trackers). */
  footer?: ReactNode;
  onSave: (values: CheckInValues) => void;
  onClose: () => void;
}) {
  const own = sectionTrackers(section, trackers);
  const [values, setValues] = useState<CheckInValues>(() => Object.fromEntries(own.map((t) => [t.id, initialValues[t.id]])));
  const panel = useRef<HTMLDivElement>(null);
  const label = sectionLabel(section);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLElement>("input, button:not([data-close]), [role=switch], [role=radio]")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      before?.focus();
    };
  }, [onClose]);

  const save = () => onSave(Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined)));

  return createPortal(
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" data-close aria-label={`Close ${label}`} tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default border-0 bg-ink/40" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="section-title"
        className="relative flex max-h-[88dvh] w-full max-w-[430px] animate-toast-in flex-col gap-4 overflow-y-auto rounded-t-[28px] bg-page px-4 pt-2 pb-[max(20px,env(safe-area-inset-bottom))] shadow-lift sm:rounded-[28px] sm:pt-4"
      >
        <div aria-hidden="true" className="h-[5px] w-9 shrink-0 self-center rounded-full bg-line-strong sm:hidden" />
        <header className="grid grid-cols-[1fr_auto_1fr] items-center">
          <button type="button" data-close onClick={onClose} className="min-h-11 cursor-pointer justify-self-start border-0 bg-transparent px-0 text-[17px] text-accent">
            Cancel
          </button>
          <div className="flex flex-col items-center">
            <h2 id="section-title" className="m-0 text-[17px] font-semibold">
              {label}
            </h2>
            <span className="text-xs text-soft">{dayLabel}</span>
          </div>
          {own.length > 0 && (
            <button type="button" onClick={save} className="min-h-11 cursor-pointer justify-self-end rounded-full border-0 bg-pop px-4 text-[17px] font-semibold text-ink hover:bg-pop-strong">
              Save
            </button>
          )}
        </header>

        {own.length === 0 && <p className="m-0 text-[15px] text-soft">Nothing to log here yet. Add the tracker in Settings.</p>}
        <TrackerRows trackers={own} values={values} set={(id, v) => setValues((s) => ({ ...s, [id]: v }))} headings={section === "more"} />

        {section === "workout" && workoutHref && (
          <Link href={workoutHref} className="flex min-h-[52px] items-center justify-between rounded-[14px] border border-line bg-card px-4 text-[17px] text-ink no-underline hover:text-ink">
            Log a workout <span aria-hidden="true" className="text-soft">›</span>
          </Link>
        )}
        {footer}
      </div>
    </div>,
    document.body,
  );
}
