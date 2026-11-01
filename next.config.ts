import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: {
    // Reuse a visited page for 2 minutes when going back and forth (saves clear it at once via revalidatePath).
    staleTimes: { dynamic: 120, static: 300 },
  },
  partialPrefetching: true,
  // The service worker is always re-checked, so a new version reaches the phone on the next visit.
  async headers() {
    return [{ source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] }];
  },
  // v10: 4 tabs. The old addresses go to their new homes (and the same under /demo).
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
