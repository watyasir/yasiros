"use client";

import { SwitchRow } from "@/components/Switch";
import { AREA_ORDER, type CheckInValues, type Tracker } from "@/lib/trackers";
import { ChoiceRow, GroupCard, NumberRow, TimeRow } from "./CheckInRows";

/**
 * The rows for a list of trackers, one kind per type: switches, times and numbers in one card,
 * choices as segmented rows, grouped trackers (Meals, Blood pressure) in their own card.
 * `headings` adds the area names (Health, Body, …), for the longer "More" section.
 */
export function TrackerRows({
  trackers,
  values,
  set,
  headings = false,
}: {
  trackers: Tracker[];
  values: CheckInValues;
  set: (id: string, value: number | undefined) => void;
  headings?: boolean;
}) {
  const areas = AREA_ORDER.filter((a) => trackers.some((t) => t.area === a));
  return areas.map((area) => {
    const inArea = trackers.filter((t) => t.area === area);
    const loose = inArea.filter((t) => !t.group_name);
    const listRows = loose.filter((t) => t.type === "checkbox" || t.type === "number" || t.type === "time_of_day");
    const choiceRows = loose.filter((t) => t.type === "scale_1_5" || t.type === "duration_minutes" || t.type === "choice");
    const groups = [...new Set(inArea.map((t) => t.group_name).filter((g) => g != null))];
    return (
      <section key={area} aria-label={headings ? area : undefined} className="flex flex-col gap-1.5">
        {headings && <h3 className="m-0 ml-4 text-[13px] font-medium text-soft">{area}</h3>}
        {listRows.length > 0 && (
          <div className="rounded-[14px] border border-line bg-card px-4 [&>*:first-child]:border-t-0">
            {listRows.map((t) =>
              t.type === "checkbox" ? (
                <SwitchRow key={t.id} large label={t.name} on={values[t.id] === 1} onToggle={() => set(t.id, values[t.id] === 1 ? 0 : 1)} />
              ) : t.type === "time_of_day" ? (
                <TimeRow key={t.id} tracker={t} value={values[t.id]} onChange={(v) => set(t.id, v)} />
              ) : (
                <NumberRow key={t.id} tracker={t} value={values[t.id]} onChange={(v) => set(t.id, v)} />
              ),
            )}
          </div>
        )}
        {choiceRows.map((t) => (
          <ChoiceRow key={t.id} tracker={t} value={values[t.id]} onChange={(v) => set(t.id, v)} />
        ))}
        {groups.map((g) => (
          <GroupCard key={g} name={g} trackers={inArea.filter((t) => t.group_name === g)} values={values} set={set} />
        ))}
      </section>
    );
  });
}
