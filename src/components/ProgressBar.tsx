import { toneBg, type Tone } from "@/lib/tones";

/**
 * A thin bar that grows in from 0 when it first shows (CSS only; instant with reduced motion).
 * `onDark` is for the dark hero tile: a light track and the highlight colour as the fill.
 */
export function ProgressBar({ pct, tone, label, thick = false, onDark = false }: { pct: number; tone: Tone; label: string; thick?: boolean; onDark?: boolean }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`shrink-0 overflow-hidden rounded-full ${onDark ? "bg-white/20" : "bg-ink/10"} ${thick ? "h-3" : "h-1.5"}`}
    >
      <div
        className={`h-full w-(--pct) rounded-full transition-[width] duration-700 ease-out starting:w-0 ${onDark ? "bg-dot-on" : toneBg[tone]}`}
        style={{ ["--pct" as string]: `${pct}%` }}
      />
    </div>
  );
}
