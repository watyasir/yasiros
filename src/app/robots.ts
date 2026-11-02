import type { MetadataRoute } from "next";

/** Search engines may list the welcome page and the demo; never the private pages or the API. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/$", "/demo"],
      disallow: ["/api/", "/log", "/settings", "/login", "/health", "/finance", "/work", "/gallery", "/progress", "/auth/"],
    },
  };
}
