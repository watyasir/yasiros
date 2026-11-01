"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import type { ViewId } from "@/modules/types";
import { useDashboard } from "./DashboardContext";

/** The four tabs (v10). Gallery has an address but no tab: Settings links to it. */
const NAV: { id: ViewId; label: string; icon: IconName }[] = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "health", label: "Health", icon: "heart" },
  { id: "finance", label: "Finance", icon: "rupee" },
  { id: "work", label: "Work", icon: "board" },
];

const ADDRESS: Record<ViewId, string> = { overview: "", health: "/health", finance: "/finance", work: "/work", gallery: "/gallery" };

/** A view's address: "/work", "/demo/work", "/" or "/demo". */
export const viewHref = (base: string, id: ViewId) => `${base}${ADDRESS[id]}` || "/";

const pill = "press flex min-h-11 items-center rounded-full px-4 text-sm font-semibold no-underline";

/** The four page links (from 561px) with Check-in and Settings. On the phone the tab bar carries the page links. */
export function TopBar() {
  const { data, view } = useDashboard();
  return (
    <header className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <nav aria-label="Pages" className="hidden flex-1 flex-wrap gap-1 min-[561px]:flex">
        {NAV.map((n) => (
          <Link
            key={n.id}
            href={viewHref(data.basePath, n.id)}
            prefetch
            aria-current={view === n.id ? "page" : undefined}
            className={`flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold no-underline ${
              view === n.id ? "border border-line bg-card text-ink shadow-tile" : "text-soft hover:text-ink"
            }`}
          >
            {n.label}
            {n.id === "work" && data.navBadges.work && <span className="font-mono text-xs text-soft">{data.navBadges.work}</span>}
          </Link>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2">
        {data.settingsHref && (
          <Link href={data.settingsHref} prefetch className={`${pill} border border-line bg-card text-ink hover:bg-fill-strong`}>
            Settings
          </Link>
        )}
        <Link href={data.logHref} prefetch className={`${pill} bg-accent-soft text-ink hover:brightness-95`}>
          Check-in
        </Link>
      </div>
    </header>
  );
}

/** Phone (560px and under): the four page links as a tab bar at the bottom of the screen. */
export function TabBar() {
  const { data, view } = useDashboard();
  return (
    <nav aria-label="Pages" className="tabbar fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] min-[561px]:hidden">
      <ul className="m-0 grid list-none grid-cols-4 p-0">
        {NAV.map((n) => (
          <li key={n.id}>
            <Link
              href={viewHref(data.basePath, n.id)}
              prefetch
              aria-current={view === n.id ? "page" : undefined}
              className={`press flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold no-underline ${view === n.id ? "text-ink" : "text-soft"}`}
            >
              <span className={`grid h-7 w-11 place-items-center rounded-full ${view === n.id ? "bg-pop" : ""}`}>
                <Icon name={n.icon} size={18} strokeWidth={2} />
              </span>
              {n.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
