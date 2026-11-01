import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { ServiceWorker } from "@/components/ServiceWorker";
import { DEFAULT_THEME, THEME_BG, THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

// iPhone launch screens (public/splash): pixel width, height, CSS width, height, pixel ratio.
const SPLASH = [
  [1320, 2868, 440, 956, 3],
  [1206, 2622, 402, 874, 3],
  [1290, 2796, 430, 932, 3],
  [1179, 2556, 393, 852, 3],
  [1284, 2778, 428, 926, 3],
  [1170, 2532, 390, 844, 3],
  [1125, 2436, 375, 812, 3],
  [828, 1792, 414, 896, 2],
] as const;

export const metadata: Metadata = {
  title: "Yasir OS",
  description: "A personal life dashboard with a 90-day Winter Arc season.",
  // Home-screen app on iPhone (the manifest is src/app/manifest.ts).
  // "default" = dark status-bar text on the light page. The extra meta is the older spelling iOS reads for "open as an app".
  appleWebApp: { capable: true, title: "Yasir OS", statusBarStyle: "default", startupImage: SPLASH.map(([w, h, dw, dh, r]) => ({ url: `/splash/splash-${w}x${h}.png`, media: `(device-width: ${dw}px) and (device-height: ${dh}px) and (-webkit-device-pixel-ratio: ${r}) and (orientation: portrait)` })) },
  other: { "apple-mobile-web-app-capable": "yes", "mobile-web-app-capable": "yes" },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

// Self-hosted by next/font at build time. Display 800 (numbers, headings), body 500/600/700, labels 700.
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["800"], variable: "--font-bricolage", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["700"], variable: "--font-jetbrains", display: "swap" });

export const viewport: Viewport = {
  // Candy's page colour; the theme script swaps it for the chosen theme's.
  themeColor: THEME_BG[DEFAULT_THEME],
  colorScheme: "light",
  // Fill the whole screen in the home-screen app; the pages keep clear of the notch with env(safe-area-inset-*).
  viewportFit: "cover",
};

/**
 * The theme comes from a cookie (mirroring Supabase). Pages are prerendered (cacheComponents), so
 * a tiny blocking script in <head> sets data-theme before the first paint: no flash of Candy.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme={DEFAULT_THEME} suppressHydrationWarning className={`h-full ${bricolage.variable} ${inter.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
