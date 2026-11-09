import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckInHub } from "@/components/checkin/CheckInHub";
import { MoreLogs } from "@/components/checkin/MoreLogs";
import { demoCheckin, demoCheckInValues, demoTrackers } from "@/data/demo/checkin";

export const metadata: Metadata = {
  title: "Demo check-in",
  description: "The daily check-in on made-up sample data. Nothing is saved.",
};

/** /demo/log: the same section list and sheets as the real check-in, on fake data. Nothing is saved. */
export default function DemoLogPage() {
  return (
    <Suspense>
      <CheckInHub
        trackers={demoTrackers}
        values={demoCheckInValues}
        saved={demoCheckin.saved}
        workedOut={demoCheckin.workedOut}
        // Fixed date, to match the rest of the demo.
        dayLabel="Sunday, 18 Oct 2026"
        homeHref="/demo"
        workoutHref="/demo/log/workout"
        moreLinks={<MoreLogs workoutHref="/demo/log/workout" bodyHref="/demo/log/body" />}
        footer={<p className="m-0 mx-4 text-[13px] text-soft">Demo: nothing is saved. The real check-in stores each value in the database.</p>}
      />
    </Suspense>
  );
}
