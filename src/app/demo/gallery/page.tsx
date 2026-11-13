import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { demoData } from "@/data/demo";
import { GalleryView } from "@/modules/gallery/GalleryView";

export const metadata: Metadata = { title: "Demo · Gallery", description: "Decko on made-up sample data. No login needed." };

export default function Page() {
  return (
    <Dashboard data={demoData} view="gallery">
      <GalleryView />
    </Dashboard>
  );
}
