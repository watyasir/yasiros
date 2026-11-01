import type { Metadata } from "next";
import { OwnerDashboard } from "../OwnerDashboard";

export const metadata: Metadata = { title: "Work" };

export default function Page() {
  return <OwnerDashboard view="work" />;
}
