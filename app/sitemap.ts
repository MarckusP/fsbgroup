import type { MetadataRoute } from "next";
import { LOCALES } from "@/content/dictionaries/types";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Só a home entra: /events e /company ainda são placeholders com noindex.
  return LOCALES.map((lang) => ({
    url: `${site.url}/${lang}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: lang === "pt" ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${site.url}/${l}`]),
      ),
    },
  }));
}
