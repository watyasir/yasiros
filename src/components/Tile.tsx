"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useTilt } from "./useTilt";

/** Tile fills (v9): white, the dark hero, or one colour per Overview tile. Ink text on all but the hero. */
const tones = {
  card: "bg-card text-ink",
  hero: "bg-hero text-white",
  tasks: "bg-t-tasks text-ink",
  money: "bg-t-money text-ink",
  // Saturated: secondary text is ink here too (scripts/contrast.mjs).
  check: "bg-t-check text-ink [--th-soft:var(--th-ink)]",
  today: "bg-t-today text-ink",
  weight: "bg-t-weight text-ink",
  fund: "bg-t-fund text-ink",
  diet: "bg-t-diet text-ink",
  study: "bg-t-study text-ink",
  claude: "bg-t-claude text-ink",
};

export type TileTone = keyof typeof tones;

/**
 * The one tile every page uses (v9 Playground): 28px corners (24 on the phone), soft shadow,
 * 16px padding on the phone and 20px from 640px up. The heading is a mono label and the tile's
 * one link to its full page (or, with `stretch`, the whole tile is that link). `area` places it in the Overview bento; `tilt` (Overview) leans it
 * toward the mouse.
 */
export function Tile({
  title,
  href,
  stretch = false,
  aside,
  tone = "card",
  area,
  tilt = false,
  className = "",
  children,
}: {
  title: string;
  /** The tile's full page. Omitted on a page's own tiles. */
  href?: string;
  /** The whole tile is the link (the heading's link covers it). */
  stretch?: boolean;
  /** Right of the heading: a count, a chip. */
  aside?: ReactNode;
  tone?: TileTone;
  area?: string;
  tilt?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const tiltProps = useTilt(tilt);
  return (
    <section
      aria-label={title}
      style={area ? { gridArea: area } : undefined}
      {...tiltProps}
      className={`relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-tile p-4 shadow-tile sm:p-5 ${tilt ? "tilt" : ""} ${tones[tone]} ${className}`}
    >
      <div className="flex min-h-6 items-center justify-between gap-2">
        <h2 className={`label m-0 ${tone === "hero" ? "text-hero-soft" : "text-soft"}`}>
          {href ? (
            <Link
              href={href}
              prefetch
              className={`-m-2 inline-flex min-h-11 items-center gap-1 rounded-item p-2 text-inherit no-underline hover:underline ${stretch ? "after:absolute after:inset-0 after:content-['']" : ""}`}
            >
              {title}
              <span aria-hidden="true">→</span>
            </Link>
          ) : (
            title
          )}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** A big number with its unit: "58.4 kg", in the display font. */
export function BigNumber({ value, unit, size = "lg" }: { value: string; unit?: string; size?: "md" | "lg" }) {
  return (
    <span className={`display leading-none ${size === "lg" ? "text-[36px]" : "text-[28px]"}`}>
      {value}
      {unit && <span className="ml-1 font-sans text-sm font-semibold tracking-normal text-soft">{unit}</span>}
    </span>
  );
}
