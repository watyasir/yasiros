import type { Metadata } from "next";
import { OwnerDashboard } from "../OwnerDashboard";
import { GalleryView } from "@/modules/gallery/GalleryView";

export const metadata: Metadata = { title: "Gallery" };

export default function Page() {
  return (
    <OwnerDashboard view="gallery">
      <GalleryView />
    </OwnerDashboard>
  );
}
