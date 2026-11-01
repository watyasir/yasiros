import type { Metadata } from "next";
import { Suspense } from "react";
import { SheetSkeleton } from "@/components/Skeleton";
import { WorkoutForm } from "@/components/body/WorkoutForm";
import { requireUser } from "@/lib/auth";
import { loadWorkouts } from "@/lib/body-store";
import { todayISO } from "@/lib/trackers";
import { deleteWorkout, saveWorkout } from "./actions";

export const metadata: Metadata = { title: "Workout · Yasir OS" };

export default function WorkoutPage({ searchParams }: { searchParams: Promise<{ repeat?: string }> }) {
  return (
    <Suspense fallback={<SheetSkeleton label="Loading your workouts" />}>
      <WorkoutLog searchParams={searchParams} />
    </Suspense>
  );
}

async function WorkoutLog({ searchParams }: { searchParams: Promise<{ repeat?: string }> }) {
  const [{ supabase }, { repeat }] = await Promise.all([requireUser(), searchParams]);

  // The last 60 sessions: plenty for name suggestions, small enough to load fast.
  const workouts = await loadWorkouts(supabase, { limit: 60 });
  if (!workouts) {
    return <p className="p-6 text-center text-[15px] text-danger">Couldn&apos;t load your workouts. Refresh to try again.</p>;
  }

  return (
    <WorkoutForm
      today={todayISO()}
      recent={workouts.slice(0, 5)}
      exerciseNames={unique(workouts.flatMap((w) => w.sets.map((s) => s.exercise)))}
      workoutNames={unique(workouts.map((w) => w.name))}
      startWithRepeat={repeat === "1"}
      cancelHref="/"
      onSave={saveWorkout}
      onDelete={deleteWorkout}
    />
  );
}

/** Each name once (ignoring case), most recent spelling first. */
function unique(names: string[]): string[] {
  const seen = new Map<string, string>();
  for (const n of names) if (!seen.has(n.toLowerCase())) seen.set(n.toLowerCase(), n);
  return [...seen.values()];
}
