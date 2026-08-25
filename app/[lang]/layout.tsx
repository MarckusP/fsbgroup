import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import {
  getDictionary,
  HTML_LANG,
  isLocale,
  LOCALES,
  type Locale,
} from "@/lib/dictionaries";
import "../globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);

  return {
    metadataBase: new URL(site.url),
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${lang}/`,
      languages: Object.fromEntries(
        LOCALES.map((l) => [HTML_LANG[l], `/${l}/`]),
      ),
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: dict.meta.title,
      description: dict.meta.description,
      locale: HTML_LANG[lang].replace("-", "_"),
      images: [{ url: "/media/hero/fsb-hero-poster.webp", width: 1280, height: 720 }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={HTML_LANG[lang as Locale]}
      className={`${archivo.variable} ${inter.variable}`}
    >
      <head>
        {/* Sem JS a abertura nunca termina, e a página inteira ficaria em opacity-0.
            O conteúdo já está no HTML servido — aqui só devolvemos a visibilidade. */}
        <noscript>
          <style>{
            "[data-curtain]{opacity:1!important;transform:none!important}" +
            "[data-intro-curtain]{display:none!important}"
          }</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
