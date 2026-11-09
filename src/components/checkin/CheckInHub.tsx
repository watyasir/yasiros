"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { isSectionKey, SECTIONS } from "@/lib/checkin-sections";
import type { CheckInValues, Tracker } from "@/lib/trackers";
import type { SaveCheckin } from "@/modules/types";
import { SectionSheet } from "./SectionSheet";
import { useSectionSave } from "./useSectionSave";

/**
 * /log (v10.2): no long form any more. A short list of the 5 sections with today's done mark, then
 * "More". Each row opens just that section in the same sheet as the Today card, at its own address
 * (/log?section=sleep), so it can be bookmarked or linked. "More" holds every other tracker and the
 * longer logs. Nothing is hidden or archived: every tracker is in exactly one section or in More.
 */
export function CheckInHub({
  trackers,
  values,
  saved,
  workedOut,
  dayLabel,
  homeHref,
  workoutHref,
  save,
  notice,
  moreLinks,
  footer,
}: {
  trackers: Tracker[];
  values: CheckInValues;
  /** Tracker ids with a value saved today. */
  saved: string[];
  /** A workout session was logged today (counts as Workout done). */
  workedOut: boolean;
  dayLabel: string;
  homeHref: string;
  workoutHref: string;
  /** Real check-in only; the demo pretends. */
  save?: SaveCheckin;
  notice?: string;
  /** The longer logs, shown at the bottom of the More sheet. */
  moreLinks: ReactNode;
  footer?: ReactNode;
}) {
  const router = useRouter();
  const path = usePathname();
  const asked = useSearchParams().get("section");
  const section = isSectionKey(asked) ? asked : null;
  const checkin = useSectionSave({ trackers, values, saved, workedOut }, save);
  const close = () => router.replace(path, { scroll: false });
  const row =
    "press flex min-h-[56px] items-center justify-between gap-3 border-t border-line text-[17px] text-ink no-underline first:border-t-0 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col gap-[18px] px-4 pt-[max(16px,env(safe-area-inset-top))] pb-8">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="display m-0 text-[34px] leading-none">Check-in</h1>
          <span className="text-sm text-soft">{dayLabel}</span>
        </div>
        <Link href={homeHref} prefetch className="flex min-h-11 items-center text-[17px] text-accent no-underline hover:text-accent-strong">
          Done
        </Link>
      </header>

      {notice && <p className="m-0 rounded-2xl bg-fill-strong px-4 py-3 text-[15px] text-soft">{notice}</p>}

      <nav aria-label="Check-in sections" className="rounded-[14px] border border-line bg-card px-4">
        {SECTIONS.map((s) => {
          const done = checkin.done(s.key);
          return (
            <Link key={s.key} href={`${path}?section=${s.key}`} scroll={false} className={row}>
              <span className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`grid size-7 place-items-center rounded-full text-sm font-bold ${done ? "bg-ok text-white" : "border-2 border-line-strong"}`}
                >
                  {done ? "✓" : ""}
                </span>
                {s.label}
                <span className="sr-only">{done ? ", done today" : ", not done yet"}</span>
              </span>
              <span aria-hidden="true" className="text-soft">
                ›
              </span>
            </Link>
          );
        })}
        <Link href={`${path}?section=more`} scroll={false} className={row}>
          <span className="flex items-center gap-3">
            <span aria-hidden="true" className="grid size-7 place-items-center rounded-full bg-fill-strong text-sm font-bold text-soft">
              +
            </span>
            More
            <span className="text-sm text-soft">weight, steps, BP, skin, hair, mood…</span>
          </span>
          <span aria-hidden="true" className="text-soft">
            ›
          </span>
        </Link>
      </nav>

      {footer}

      {section && (
        <SectionSheet
          key={section}
          section={section}
          trackers={trackers}
          initialValues={checkin.values}
          dayLabel={dayLabel}
          workoutHref={workoutHref}
          footer={section === "more" ? moreLinks : undefined}
          onClose={close}
          onSave={(sent) => {
            close();
            checkin.run(section, sent);
          }}
        />
      )}
    </div>
  );
}
