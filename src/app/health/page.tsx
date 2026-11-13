import type { Metadata } from "next";
import { OwnerDashboard } from "../OwnerDashboard";
import { HealthView } from "@/modules/health/HealthView";

export const metadata: Metadata = { title: "Health" };

export default function Page() {
  return (
    <OwnerDashboard view="health">
      <HealthView />
    </OwnerDashboard>
  );
}
