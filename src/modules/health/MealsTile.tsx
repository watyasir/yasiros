"use client";

import { EmptyNote } from "@/components/EmptyNote";
import { Tile } from "@/components/Tile";
import { useDashboard } from "@/components/dashboard/DashboardContext";
import { useToast } from "@/components/Toast";
import { useConfetti } from "@/components/useConfetti";

const MEAL_WORDS = ["Planned", "Swapped", "Skipped"];
const MARK: Record<string, string> = { Planned: "✓ ", Swapped: "~ ", Skipped: "✕ " };
const CHIP: Record<string, string> = { Planned: "bg-ink text-white", Swapped: "bg-warn-soft text-warn", Skipped: "bg-white/70 text-danger line-through" };

/**
 * Today's 7 meal slots as chips (planned, swapped, skipped). A tap toggles planned and skipped and
 * saves to today's check-in (swapped is set in /log). All 7 planned: confetti and a toast.
 */
export function MealsTile() {
  const { data, entries, setEntry } = useDashboard();
  const toast = useToast();
  const confetti = useConfetti();
  const meals = data.meals.map((m) => {
    const key = `meal:${m.name}`;
    return key in entries ? { ...m, key, status: entries[key] == null ? null : MEAL_WORDS[entries[key]! - 1] } : { ...m, key };
  });
  const planned = meals.filter((m) => m.status === "Planned").length;

  const tap = (i: number) => {
    const m = meals[i];
    const next = m.status === "Planned" ? 3 : 1;
    const allIn = next === 1 && planned + 1 === meals.length;
    setEntry(m.key, m.trackerId, next, m.name, () => {
      if (!allIn) return;
      confetti({ count: 90 });
      toast({ text: "All meals in. Diet day done." });
    });
  };

  return (
    <Tile title="Meals" href={data.logHref} tone="today" aside={meals.length > 0 && <span className="label">{planned}/{meals.length}</span>}>
      {meals.length === 0 ? (
        <EmptyNote>Meal slots appear once the check-in has them.</EmptyNote>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Meals today">
          {meals.map((m, i) => (
            <li key={m.name}>
              <button
                type="button"
                onClick={() => tap(i)}
                aria-pressed={m.status === "Planned"}
                aria-label={`${m.name}: ${m.status ?? "not logged"}. Tap to mark ${m.status === "Planned" ? "skipped" : "as planned"}`}
                className={`press min-h-7 cursor-pointer rounded-full border-0 px-3 text-xs font-semibold pointer-coarse:min-h-11 ${m.status ? CHIP[m.status] : "bg-white/70 text-ink"}`}
              >
                {m.status ? MARK[m.status] : ""}
                {m.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Tile>
  );
}
