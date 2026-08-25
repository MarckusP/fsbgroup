import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Exigido pelo `output: "export"`: sem isso o Next não sabe que esta rota pode
// ser resolvida inteira em build time (não depende de nada dinâmico).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
