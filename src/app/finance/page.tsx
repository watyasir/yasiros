import type { Metadata } from "next";
import { OwnerDashboard } from "../OwnerDashboard";
import { FinanceView } from "@/modules/finance/FinanceView";

export const metadata: Metadata = { title: "Finance" };

export default function Page() {
  return (
    <OwnerDashboard view="finance">
      <FinanceView />
    </OwnerDashboard>
  );
}
