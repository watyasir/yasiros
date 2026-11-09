import { cacheLife } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { PageSkeleton } from "@/components/Skeleton";
import { currentOwner } from "@/lib/auth";
import { loadDashboardData } from "@/lib/dashboard/load";
import type { ViewId } from "@/modules/types";
import { saveCheckIn } from "./log/actions";
import { addTask, deleteGalleryItem, deleteTask, listGallery, moveTask, updateTask } from "./actions";

/**
 * One page of the real app, signed in as the owner. Every page reads the same data (private
 * cache, preloaded with each tab), so moving between them is instant. Anyone else goes to /login (`/` shows a welcome instead).
 */
export function OwnerDashboard({ view, signedOut }: { view: ViewId; signedOut?: React.ReactNode }) {
  return (
    <Suspense
      fallback={<PageSkeleton />}
    >
      <Content view={view} signedOut={signedOut} />
    </Suspense>
  );
}

async function Content({ view, signedOut }: { view: ViewId; signedOut?: React.ReactNode }) {
  const loaded = await ownerData();
  if (loaded.state === "out") {
    if (signedOut) return signedOut;
    redirect("/login");
  }
  if (loaded.state === "error") {
    return <p className="m-0 p-6 text-center text-sm text-danger">Couldn&apos;t load your dashboard. Refresh to try again.</p>;
  }
  return (
    <Dashboard
      data={loaded.data}
      view={view}
      taskActions={{ add: addTask, update: updateTask, move: moveTask, remove: deleteTask }}
      galleryActions={{ list: listGallery, remove: deleteGalleryItem }}
      saveCheckin={saveCheckIn}
    />
  );
}

/*
  The dashboard data as a private cache (per signed-in browser, never shared on the server), so
  each tab's preload carries the data along and even a first tap on Health, Finance or Work opens
  instantly, like the check-in. Fresh for 60 seconds; every save refreshes the page anyway.
*/
async function ownerData() {
  "use cache: private";
  cacheLife({ stale: 60 });
  const owner = await currentOwner();
  if (!owner) return { state: "out" as const };
  const data = await loadDashboardData(owner.supabase);
  return data ? { state: "ok" as const, data } : { state: "error" as const };
}
