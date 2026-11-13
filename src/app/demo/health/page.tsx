import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { demoData } from "@/data/demo";
import { HealthView } from "@/modules/health/HealthView";

export const metadata: Metadata = { title: "Demo · Health", description: "Decko on made-up sample data. No login needed." };

export default function Page() {
  return (
    <Dashboard data={demoData} view="health">
      <HealthView />
    </Dashboard>
  );
}
