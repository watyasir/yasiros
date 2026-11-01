"use client";

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

/** Top of every page: the 4 tabs from 561px up (the phone has the tab bar), then Check-in and Settings. */
export function TopBar() {
  const { data, view } = useDashboard();
  return (
    <header className="no-select flex items-center gap-3">
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

/** Phone (560px and under): the 4 tabs at the bottom, above the home indicator, a pill on the active one. */
export function TabBar() {
  const { data, view } = useDashboard();
  return (
    <nav aria-label="Pages" className="no-select fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur min-[561px]:hidden">
      <ul className="m-0 grid list-none grid-cols-4 px-[env(safe-area-inset-left)] p-0">
        {TABS.map((t) => (
          <li key={t.id}>
            <Link
              href={viewHref(data.basePath, t.id)}
              prefetch
              aria-current={view === t.id ? "page" : undefined}
              className={`press flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold no-underline ${view === t.id ? "text-ink" : "text-soft"}`}
            >
              <span className={`grid h-7 w-14 place-items-center rounded-full transition-colors ${view === t.id ? "bg-pop" : ""}`}>
                <Icon name={t.icon} size={18} strokeWidth={2} />
              </span>
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
