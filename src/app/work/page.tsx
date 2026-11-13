import type { Metadata } from "next";
import { OwnerDashboard } from "../OwnerDashboard";
import { WorkView } from "@/modules/work/WorkView";

export const metadata: Metadata = { title: "Work" };

export default function Page() {
  return (
    <OwnerDashboard view="work">
      <WorkView />
    </OwnerDashboard>
  );
}
