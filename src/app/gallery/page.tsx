import type { Metadata } from "next";
import { OwnerDashboard } from "../OwnerDashboard";

export const metadata: Metadata = { title: "Gallery" };

export default function Page() {
  return <OwnerDashboard view="gallery" />;
}
