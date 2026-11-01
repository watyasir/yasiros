import type { Metadata } from "next";
import { ProgressCard } from "@/components/share/ProgressCard";
import { demoData } from "@/data/demo";
import { toShareCard } from "@/lib/share";

export const metadata: Metadata = {
  title: "Demo progress card",
  description: "The shareable Winter Arc card on made-up sample data.",
};

export default function DemoProgressPage() {
  return <ProgressCard card={toShareCard(demoData)} sharePath="/demo/progress" backHref="/demo" demo />;
}
