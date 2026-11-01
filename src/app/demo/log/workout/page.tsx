import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoWorkoutForm } from "@/components/body/DemoForms";

export const metadata: Metadata = {
  title: "Demo workout",
  description: "The workout log on made-up sample data. Nothing is saved.",
};

type Search = Promise<{ repeat?: string }>;

export default function DemoWorkoutPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<p className="p-6 text-center text-[15px] text-soft">Loading the workout log…</p>}>
      <DemoWorkout searchParams={searchParams} />
    </Suspense>
  );
}

async function DemoWorkout({ searchParams }: { searchParams: Search }) {
  const { repeat } = await searchParams;
  return <DemoWorkoutForm repeat={repeat === "1"} />;
}
