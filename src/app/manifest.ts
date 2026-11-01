import type { MetadataRoute } from "next";
import { DEFAULT_THEME, THEME_BG } from "@/lib/theme";

/** Install as a home-screen app (M10). Colours match the page (Candy, the default theme). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Decko",
    short_name: "Decko",
    description: "A personal life dashboard with a 90-day Winter Arc season.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: THEME_BG[DEFAULT_THEME],
    theme_color: THEME_BG[DEFAULT_THEME],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
