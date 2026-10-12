import type { MetadataRoute } from "next";

const ROUTES = ["", "overview", "assessment", "results", "methods", "about"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://hifuweb.example.com";
  return ROUTES.map((r) => ({
    url: `${base}/${r}`.replace(/\/$/, "") || base,
    lastModified: new Date("2026-01-01"),
    changeFrequency: "monthly",
    priority: r === "" ? 1 : 0.8,
  }));
}
