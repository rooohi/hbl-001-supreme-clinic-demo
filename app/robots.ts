import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const allowPublicIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  if (!allowPublicIndexing) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: ["/book", "/book/"],
      disallow: ["/", "/api/", "/track/"],
    },
    ...(baseUrl ? { sitemap: `${baseUrl}/sitemap.xml` } : {}),
  };
}
