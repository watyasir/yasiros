import type { Metadata } from "next";
import { DemoBodyCheckForm } from "@/components/body/DemoForms";

export const metadata: Metadata = {
  title: "Demo body check",
  description: "The weekly body check on made-up sample data. Nothing is saved.",
};

export default function DemoBodyPage() {
  return <DemoBodyCheckForm />;
}
