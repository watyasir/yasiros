import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import { ServiceWorker } from "@/components/ServiceWorker";
import { DEFAULT_THEME, THEME_BG, THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

/** iPhone launch screen sizes: pixels, then the screen in CSS pixels and its pixel ratio. */
const SPLASH: [number, number, number, number, number][] = [
  [1320, 2868, 440, 956, 3], // 16 Pro Max
  [1206, 2622, 402, 874, 3], // 16 Pro
  [1290, 2796, 430, 932, 3], // 16 Plus, 15 Plus / Pro Max, 14 Pro Max
  [1179, 2556, 393, 852, 3], // 16, 15, 15 Pro, 14 Pro
  [1170, 2532, 390, 844, 3], // 14, 13, 13 Pro, 12, 12 Pro
  [1125, 2436, 375, 812, 3], // 13 mini, 12 mini, 11 Pro, XS, X
  [828, 1792, 414, 896, 2], // 11, XR
  [750, 1334, 375, 667, 2], // SE (2nd and 3rd), 8
];

export const metadata: Metadata = {
  // Display name only: the repo, address and routes stay "yasiros".
  title: { default: "Decko", template: "%s · Decko" },
  description: "A personal life dashboard with a 90-day Winter Arc season.",
  // Home-screen app on iPhone (the manifest is src/app/manifest.ts).
  appleWebApp: {
    capable: true,
    title: "Decko",
    statusBarStyle: "default",
    // Launch screens: the Candy page colour with the Bento icon (public/splash, portrait).
    startupImage: SPLASH.map(([w, h, cssW, cssH, dpr]) => ({
      url: `/splash/splash-${w}x${h}.png`,
      media: `(device-width: ${cssW}px) and (device-height: ${cssH}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)`,
    })),
  },
  // Written out too: iOS still reads the older apple-mobile-web-app-capable tag for "open as an app".
  other: { "apple-mobile-web-app-capable": "yes" },
  // Icons come from files: src/app/icon.svg (sharp tab icon), favicon.ico (16, 32, 48 px) and
  // apple-icon.png (home screen, 180 px), all rendered from the Bento icon (public/icons/icon.svg).
};

// Self-hosted by next/font at build time. Display 800 (numbers, headings), body 500/600/700, labels 700.
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["800"], variable: "--font-bricolage", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-inter", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["700"], variable: "--font-jetbrains", display: "swap" });

export const viewport: Viewport = {
  // Candy's page colour; the theme script swaps it for the chosen theme's.
  themeColor: THEME_BG[DEFAULT_THEME],
  colorScheme: "light",
  // Edge to edge on the iPhone; pages pad themselves with the safe-area insets.
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
