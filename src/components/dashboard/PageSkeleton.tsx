import type { ViewId } from "@/modules/types";

/*
  What shows while a page loads: tile-shaped placeholders in the page's own layout and tones,
  with a soft pulse. Never a blank screen. (The tones are the real tile fills.)
*/

const bone = "skeleton rounded-tile shadow-tile";

/** Each page's tiles as [fill class, grid placement]. */
const LAYOUTS: Record<ViewId, { grid: string; tiles: [string, string][] }> = {
  overview: {
    grid: "grid-cols-1 min-[561px]:grid-cols-2 min-[961px]:grid-cols-4 min-[961px]:grid-rows-[158px_158px_auto]",
    tiles: [
      ["bg-hero h-44 min-[561px]:col-span-2 min-[561px]:row-span-2 min-[561px]:h-auto", ""],
      ["bg-t-tasks h-44 min-[561px]:row-span-2 min-[561px]:h-auto", ""],
      ["bg-t-money h-44 min-[561px]:row-span-2 min-[561px]:h-auto", ""],
      ["bg-t-fund h-24 min-[561px]:col-span-2 min-[961px]:col-span-4", ""],
    ],
  },
  health: {
    grid: "grid-cols-1 min-[861px]:grid-cols-3",
    tiles: [
      ["bg-hero h-64 min-[861px]:col-span-3", ""],
      ["bg-t-weight h-52", ""],
      ["bg-t-study h-52", ""],
      ["bg-t-diet h-52", ""],
      ["bg-t-today h-36 min-[861px]:col-span-2", ""],
      ["bg-card h-36", ""],
    ],
  },
  finance: {
    grid: "grid-cols-1 min-[861px]:grid-cols-2",
    tiles: [
      ["bg-t-money h-72", ""],
      ["bg-card h-72", ""],
      ["bg-t-fund h-36 min-[861px]:col-span-2", ""],
    ],
  },
  work: {
    grid: "grid-cols-1 min-[701px]:grid-cols-2 min-[1101px]:grid-cols-3",
    tiles: ["bg-t-tasks", "bg-t-study", "bg-t-fund", "bg-t-today", "bg-t-money", "bg-card"].map((c) => [`${c} h-64`, ""] as [string, string]),
  },
  gallery: { grid: "grid-cols-2 min-[700px]:grid-cols-4", tiles: Array.from({ length: 8 }, () => ["bg-card h-40", ""] as [string, string]) },
};

export function PageSkeleton({ view }: { view: ViewId }) {
  const { grid, tiles } = LAYOUTS[view];
  return (
    <div role="status" aria-label="Loading" className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-28 sm:px-6">
      <div className="skeleton h-11 w-64 rounded-full bg-ink/10" />
      <div className="skeleton h-10 w-48 rounded-item bg-ink/10" />
      <div className={`grid gap-4 ${grid}`}>
        {tiles.map(([cls], i) => (
          <div key={i} className={`${bone} ${cls}`} />
        ))}
      </div>
    </div>
  );
}
