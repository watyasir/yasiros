"use client";

import { ViewTransition } from "react";
import { ToastProvider } from "@/components/Toast";
import { OverviewHeader } from "@/modules/overview/OverviewHeader";
import type { DashboardData, GalleryActions, SaveCheckin, TaskActions, ViewId } from "@/modules/types";
import { openTasks, workSummary } from "@/lib/tasks";
import { DashboardProvider, useDashboard } from "./DashboardContext";
import { TabBar, TopBar } from "./Nav";
import { ThemeSync } from "./ThemeSync";

/**
 * The app frame for every page: top bar, the page's title, the view, and the phone tab bar.
 * One fluid layout for phone and laptop. No task pop-ups (v10): the Toast is only for Undo and errors.
 */
export function Dashboard({
  data,
  loadedAt,
  view,
  taskActions,
  galleryActions,
  saveCheckin,
  children,
}: {
  data: DashboardData;
  /** Server time (ms) the real data was read. */
  loadedAt?: number;
  view: ViewId;
  taskActions?: TaskActions;
  galleryActions?: GalleryActions;
  saveCheckin?: SaveCheckin;
  /** The page's view (OverviewView, WorkView, …), passed in by each page so it only loads its own code. */
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
    <DashboardProvider data={data} loadedAt={loadedAt} view={view} taskActions={taskActions} galleryActions={galleryActions} saveCheckin={saveCheckin}>
      <ThemeSync theme={data.theme} remember={data.basePath === ""} />
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-4 pt-[max(16px,env(safe-area-inset-top))] pb-[calc(110px+env(safe-area-inset-bottom))] sm:px-6 min-[561px]:pb-12">
        <TopBar />
        {view === "overview" ? <OverviewHeader /> : <PageTitle />}
        {/* Switching tabs fades and slides the page in (globals.css, off with reduced motion). */}
        <ViewTransition default="page">
          <main className="min-w-0">
            {children}
          </main>
        </ViewTransition>
      </div>
      <TabBar />
    </DashboardProvider>
    </ToastProvider>
  );
}

/** A page's title and subtitle. Work's subtitle counts the live task list, so a tick shows at once. */
function PageTitle() {
  const { data, view, tasks } = useDashboard();
  const { title, subtitle } = data.views[view];
  const line = view === "work" ? [subtitle, workSummary(openTasks(tasks, data.goals, data.todayISO), data.todayISO)].filter(Boolean).join(" · ") : subtitle;
  return (
    <div className="flex flex-col gap-1">
      <h1 className="display m-0 text-[28px] leading-tight text-balance sm:text-[36px]">{title}</h1>
      <p className="m-0 text-sm text-soft">{line}</p>
    </div>
  );
}
