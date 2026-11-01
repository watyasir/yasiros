import type { Metadata } from "next";
import { DemoCheckIn } from "@/components/checkin/DemoCheckIn";

export const metadata: Metadata = {
  title: "Demo check-in",
  description: "The daily check-in on made-up sample data. Nothing is saved.",
};

export default function DemoLogPage() {
  // Fixed date, to match the rest of the demo.
  return <DemoCheckIn dayLabel="Sunday, 18 Oct 2026" />;
}
