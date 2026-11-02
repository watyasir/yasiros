"use client";

import Image from "next/image";
import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import type { ViewId } from "@/modules/types";
import { useDashboard } from "./DashboardContext";

/** The 4 tabs (v10). Gallery is a page too, opened from Settings, so it has no tab. */
const TABS: { id: ViewId; label: string; path: string; icon: IconName }[] = [
  { id: "overview", label: "Overview", path: "", icon: "grid" },
  { id: "health", label: "Health", path: "/health", icon: "heart" },
  { id: "finance", label: "Finance", path: "/finance", icon: "rupee" },
  { id: "work", label: "Work", path: "/work", icon: "board" },
];
const PATHS: Record<ViewId, string> = { overview: "", health: "/health", finance: "/finance", work: "/work", gallery: "/gallery" };

/** A view's address: "/work", "/demo/work", "/" or "/demo". */
export const viewHref = (base: string, id: ViewId) => `${base}${PATHS[id]}` || "/";

/** The Check-in and Settings buttons, on every page and every width. */
function Actions() {
  const { data } = useDashboard();
  return (
    <div className="ml-auto flex items-center gap-2">
      <Link href={data.logHref} prefetch className="press flex min-h-11 items-center rounded-full bg-accent-soft px-4 text-sm font-semibold text-ink no-underline hover:brightness-95">
        Check-in
      </Link>
      <Link
        href={data.settingsHref}
        prefetch
        aria-label="Settings"
        className="press grid size-11 place-items-center rounded-full border border-line bg-card text-ink no-underline shadow-tile hover:bg-fill"
      >
        <Icon name="gear" size={18} strokeWidth={2} />
      </Link>
    </div>
  );
}

/** Top of every page: the 4 tabs from 561px up, or the Decko mark and name on a phone (the tab bar is at the bottom there), then Check-in and Settings. */
export function TopBar() {
  const { data, view } = useDashboard();
  return (
    <header className="no-select flex items-center gap-3">
      <Link href={viewHref(data.basePath, "overview")} className="flex min-h-11 items-center gap-2 text-ink no-underline min-[561px]:hidden">
        <Image src="/icons/icon.svg" alt="" width={34} height={34} unoptimized priority className="rounded-[10px]" />
        <span className="font-display text-xl leading-none">Decko</span>
      </Link>
      <nav aria-label="Pages" className="hidden flex-wrap gap-1 min-[561px]:flex">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={viewHref(data.basePath, t.id)}
            prefetch
            aria-current={view === t.id ? "page" : undefined}
            className={`press flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold no-underline ${
              view === t.id ? "border border-line bg-card text-ink shadow-tile" : "text-soft hover:text-ink"
            }`}
          >
            {t.label}
            {t.id === "work" && data.navBadges.work && <span className="font-mono text-xs text-soft">{data.navBadges.work}</span>}
          </Link>
        ))}
      </nav>
      <Actions />
    </header>
  );
}

/**
 * Phone (560px and under): the 4 tabs in a floating bar above the home indicator. The active tab
 * is a dark pill with its icon and name; the others are icons with their names underneath.
 */
export function TabBar() {
  const { data, view } = useDashboard();
  return (
    <nav
      aria-label="Pages"
      className="no-select fixed inset-x-3 bottom-[max(10px,env(safe-area-inset-bottom))] z-20 rounded-[26px] border border-line bg-card/95 p-1.5 shadow-lift backdrop-blur min-[561px]:hidden"
    >
      <ul className="m-0 grid list-none grid-cols-4 gap-1 p-0">
        {TABS.map((t) => {
          const on = view === t.id;
          return (
            <li key={t.id}>
              <Link
                href={viewHref(data.basePath, t.id)}
                prefetch
                aria-current={on ? "page" : undefined}
                className={`press flex min-h-14 flex-col items-center justify-center gap-1 rounded-[20px] text-[11px] no-underline transition-colors duration-200 motion-reduce:transition-none ${
                  on ? "bg-hero font-bold text-white" : "font-semibold text-soft hover:bg-fill hover:text-ink"
                }`}
              >
                <Icon name={t.icon} size={22} strokeWidth={on ? 2.4 : 2} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
