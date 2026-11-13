import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { demoData } from "@/data/demo";
import { FinanceView } from "@/modules/finance/FinanceView";

export const metadata: Metadata = { title: "Demo · Finance", description: "Decko on made-up sample data. No login needed." };

export default function Page() {
  return (
    <Dashboard data={demoData} view="finance">
      <FinanceView />
    </Dashboard>
  );
}
