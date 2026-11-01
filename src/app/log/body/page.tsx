import type { Metadata } from "next";
import { Suspense } from "react";
import { SheetSkeleton } from "@/components/Skeleton";
import { BodyCheckForm } from "@/components/body/BodyCheckForm";
import { requireUser } from "@/lib/auth";
import { loadBodyChecks, loadWeightGoal } from "@/lib/body-store";
import { todayISO } from "@/lib/trackers";
import { saveBodyCheck } from "./actions";

export const metadata: Metadata = { title: "Body check" };

export default function BodyPage() {
  return (
    <Suspense fallback={<SheetSkeleton label="Loading your body check" />}>
      <BodyCheck />
    </Suspense>
  );
}

async function BodyCheck() {
  const { supabase } = await requireUser();
  const [checks, goal] = await Promise.all([loadBodyChecks(supabase, 2), loadWeightGoal(supabase)]);
  if (!checks || goal === undefined) {
    return <p className="p-6 text-center text-[15px] text-danger">Couldn&apos;t load your body checks. Refresh to try again.</p>;
  }

  const today = todayISO();
  const existing = checks[0]?.date === today ? checks[0] : null;
  return (
    <BodyCheckForm
      today={today}
      existing={existing}
      previous={(existing ? checks[1] : checks[0]) ?? null}
      goal={goal}
      cancelHref="/"
      onSave={saveBodyCheck}
    />
  );
}
