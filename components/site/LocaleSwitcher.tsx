"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/dictionaries";

/**
 * PT | EN. Troca apenas o primeiro segmento da URL, preservando a página atual —
 * quem está em /pt/events cai em /en/events, não na home.
 */
export function LocaleSwitcher({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  const pathname = usePathname();

  const hrefFor = (locale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = locale; // segments[0] é sempre "" por causa da barra inicial
    return segments.join("/") || `/${locale}`;
  };

  return (
    <nav aria-label={label} className="flex items-center gap-1 text-xs">
      {LOCALES.map((locale, index) => (
        <span key={locale} className="flex items-center gap-1">
          {index > 0 && (
            <span aria-hidden className="text-bone/25">
              /
            </span>
          )}
          <Link
            href={hrefFor(locale)}
            hrefLang={locale}
            aria-current={locale === current ? "true" : undefined}
            className={`px-1 uppercase tracking-widest transition-colors ${
              locale === current
                ? "text-bone"
                : "text-bone/40 hover:text-bone/80"
            }`}
          >
            {locale}
          </Link>
        </span>
      ))}
    </nav>
  );
}
