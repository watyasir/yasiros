/**
 * Tile-shaped placeholders while a page loads (never a blank white screen): a heading bar and a
 * few soft tiles in the page's colours. The shimmer stops with reduced motion.
 */
export function PageSkeleton({ label = "Loading" }: { label?: string }) {
  const tile = "rounded-tile bg-card/80 shadow-tile motion-safe:animate-pulse";
  return (
    <div role="status" aria-label={label} className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-4 pt-[max(16px,env(safe-area-inset-top))] pb-24 sm:px-6">
      <div className="flex items-center gap-3">
        <div className={`hidden h-11 w-80 rounded-full min-[561px]:block ${tile}`} />
        <div className={`ml-auto h-11 w-28 rounded-full ${tile}`} />
        <div className={`size-11 rounded-full ${tile}`} />
      </div>
      <div className={`h-10 w-64 max-w-full rounded-item ${tile}`} />
      <div className="grid gap-[14px] min-[561px]:grid-cols-2 min-[961px]:grid-cols-4">
        <div className={`h-[330px] min-[961px]:col-span-2 ${tile}`} />
        <div className={`h-[330px] ${tile}`} />
        <div className={`h-[330px] ${tile}`} />
        <div className={`h-28 min-[561px]:col-span-2 min-[961px]:col-span-4 ${tile}`} />
      </div>
      <span className="sr-only">{label}…</span>
    </div>
  );
}

/** The same idea for the one-column sheets (check-in, workout, body check, goals, settings). */
export function SheetSkeleton({ label = "Loading" }: { label?: string }) {
  const row = "rounded-[14px] bg-card/80 shadow-tile motion-safe:animate-pulse";
  return (
    <div role="status" aria-label={label} className="mx-auto flex w-full max-w-[430px] flex-col gap-[18px] px-4 pt-[max(24px,env(safe-area-inset-top))] pb-8">
      <div className={`h-11 w-48 ${row}`} />
      <div className={`h-40 ${row}`} />
      <div className={`h-56 ${row}`} />
      <div className={`h-32 ${row}`} />
      <span className="sr-only">{label}…</span>
    </div>
  );
}
