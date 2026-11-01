import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { demoData } from "@/data/demo";

export const metadata: Metadata = { title: "Demo · Finance · Yasir OS", description: "Yasir OS on made-up sample data. No login needed." };

export default function Page() {
  return <Dashboard data={demoData} view="finance" />;
}
