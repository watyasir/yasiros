import type { Metadata } from "next";
import { OwnerDashboard } from "../OwnerDashboard";

export const metadata: Metadata = { title: "Health" };

export default function Page() {
  return <OwnerDashboard view="health" />;
}
