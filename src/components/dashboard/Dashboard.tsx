"use client";

import { ViewTransition } from "react";
import { ToastProvider } from "@/components/Toast";
import { FinanceView } from "@/modules/finance/FinanceView";
import { GalleryView } from "@/modules/gallery/GalleryView";
import { HealthView } from "@/modules/health/HealthView";
import { OverviewHeader } from "@/modules/overview/OverviewHeader";
import { OverviewView } from "@/modules/overview/OverviewView";
import type { DashboardData, GalleryActions, SaveCheckin, TaskActions, ViewId } from "@/modules/types";
import { WorkView } from "@/modules/work/WorkView";
import { DashboardProvider } from "./DashboardContext";
import { TabBar, TopBar } from "./Nav";
import { ThemeSync } from "./ThemeSync";

const VIEWS: Record<ViewId, () => React.JSX.Element> = {
  overview: OverviewView,
  health: HealthView,
  finance: FinanceView,
  work: WorkView,
  gallery: GalleryView,
};

/**
 * The app frame for every page: top bar, the page's title, the view, and the phone tab bar.
 * One fluid layout for phone and laptop. No task pop-ups (v10): the Toast is only for Undo and errors.
 */
export function Dashboard({
  data,
  view,
  taskActions,
  galleryActions,
  saveCheckin,
}: {
  data: DashboardData;
  view: ViewId;
  taskActions?: TaskActions;
  galleryActions?: GalleryActions;
  saveCheckin?: SaveCheckin;
}) {
  const View = VIEWS[view];
  const { title, subtitle } = data.views[view];
  return (
    <ToastProvider>
    <DashboardProvider data={data} view={view} taskActions={taskActions} galleryActions={galleryActions} saveCheckin={saveCheckin}>
      <ThemeSync theme={data.theme} remember={data.basePath === ""} />
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-4 pt-[max(16px,env(safe-area-inset-top))] pb-[calc(110px+env(safe-area-inset-bottom))] sm:px-6 min-[561px]:pb-12">
        <TopBar />
        {view === "overview" ? (
          <OverviewHeader />
        ) : (
          <div className="flex flex-col gap-1">
            <h1 className="display m-0 text-[28px] leading-tight text-balance sm:text-[36px]">{title}</h1>
            <p className="m-0 text-sm text-soft">{subtitle}</p>
          </div>
        )}
        {/* Switching tabs fades and slides the page in (globals.css, off with reduced motion). */}
        <ViewTransition default="page">
          <main className="min-w-0">
            <View />
          </main>
        </ViewTransition>
      </div>
      <TabBar />
    </DashboardProvider>
    </ToastProvider>
  );
}
