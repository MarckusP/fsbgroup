import type { MetadataRoute } from "next";
import { LOCALES } from "@/content/dictionaries/types";
import { site } from "@/content/site";

// Exigido pelo `output: "export"`: sem isso o Next não sabe que esta rota pode
// ser resolvida inteira em build time (não depende de nada dinâmico).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Só a home entra: /events e /company ainda são placeholders com noindex.
  return LOCALES.map((lang) => ({
    url: `${site.url}/${lang}/`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: lang === "pt" ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [l, `${site.url}/${l}/`]),
      ),
    },
  }));
}
