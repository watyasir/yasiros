import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: {
    // Reuse a visited page for 2 minutes when going back and forth (saves clear it at once via revalidatePath).
    staleTimes: { dynamic: 120, static: 300 },
  },
  partialPrefetching: true,
  // v10 Focus: four pages. The old addresses (and the demo's) still work.
  async redirects() {
    const moved = [
      ["/money", "/finance"],
      ["/board", "/work"],
      ["/winter-arc", "/health"],
    ];
    return moved.flatMap(([from, to]) => [
      { source: from, destination: to, permanent: false },
      { source: `/demo${from}`, destination: `/demo${to}`, permanent: false },
    ]);
  },
  // The service worker is always re-checked, so a new version reaches the phone on the next visit.
  async headers() {
    return [{ source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
