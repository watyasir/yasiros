import type { Metadata } from "next";
import { Suspense } from "react";
import { SheetSkeleton } from "@/components/Skeleton";
import { GoalsForm } from "@/components/goals/GoalsForm";
import { requireUser } from "@/lib/auth";
import { buildGoals } from "@/lib/dashboard/goals";
import { loadGoals } from "@/lib/task-store";
import { loadTrackers } from "@/lib/tracker-store";
import { canSum, todayISO } from "@/lib/trackers";
import { addGoal, deleteGoal, updateGoalProgress } from "./actions";

export const metadata: Metadata = { title: "Goals · Yasir OS" };

export default function GoalsPage() {
  return (
    <Suspense fallback={<SheetSkeleton label="Loading your goals" />}>
      <Goals />
    </Suspense>
  );
}

async function Goals() {
  const { supabase } = await requireUser();
  const [trackers, loaded] = await Promise.all([loadTrackers(supabase), loadGoals(supabase)]);
  if (!trackers || !loaded) {
    return <p className="p-6 text-center text-[15px] text-danger">Couldn&apos;t load your goals. Refresh to try again.</p>;
  }
  const shown = buildGoals(loaded.goals, loaded.tracked, trackers, todayISO());
  return (
    <GoalsForm
      rows={loaded.goals.map((goal, i) => ({
        goal,
        progress: shown[i].progress,
        trackerName: trackers.find((t) => t.id === goal.trackerId)?.name ?? null,
      }))}
      trackers={trackers.filter(canSum).map(({ id, name, type, unit }) => ({ id, name, type, unit }))}
      backHref="/"
      actions={{ add: addGoal, update: updateGoalProgress, remove: deleteGoal }}
    />
  );
}
