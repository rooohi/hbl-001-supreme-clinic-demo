import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const allowPublicIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!allowPublicIndexing || !baseUrl) return [];

  return [{
    url: `${baseUrl.replace(/\/$/, "")}/book`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  }];
}
