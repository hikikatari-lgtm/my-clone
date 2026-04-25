import type { MetadataRoute } from "next";

const SITE_MODE = process.env.SITE_MODE || "public";

export default function robots(): MetadataRoute.Robots {
  if (SITE_MODE === "private") {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/novels", "/movies", "/english"],
    },
  };
}
