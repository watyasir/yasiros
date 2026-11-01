import type { Metadata } from "next";
import { OwnerDashboard } from "../OwnerDashboard";

export const metadata: Metadata = { title: "Finance" };

export default function Page() {
  return <OwnerDashboard view="finance" />;
}
