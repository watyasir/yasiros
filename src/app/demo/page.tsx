import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { demoData } from "@/data/demo";

export const metadata: Metadata = {
  title: "Demo",
  description: "The full Decko dashboard on made-up sample data. No login needed.",
};

export default function DemoPage() {
  return <Dashboard data={demoData} view="overview" />;
}
