import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: {
    // Reuse a visited page for 2 minutes when going back and forth (saves clear it at once via revalidatePath).
    staleTimes: { dynamic: 120, static: 300 },
  },
  partialPrefetching: true,
  async headers() {
    return [
      // Security headers on every page and API answer: no other site can show the app in a frame
      // (no click-tricking on Settings), files are read as the type sent, links don't leak paths,
      // the browser keeps to HTTPS, and camera/mic/location are off.
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
      // The service worker is always re-checked, so a new version reaches the phone on the next visit.
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }] },
    ];
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
