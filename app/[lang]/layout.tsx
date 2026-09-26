import type { Metadata } from "next";
import localFont from "next/font/local";
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

// Fontes hospedadas com o site (pacotes @fontsource-variable), não baixadas do Google no
// build: para fontes com eixo de largura, como a Archivo, o Google às vezes responde com
// URLs `/l/font?kit=…&skey=…`, e o `&` quebra o `next/font/google` no Turbopack ("queries
// have exactly one entry") — o deploy no GitHub Pages falhava por isso, enquanto o build
// local passava. Arquivos locais deixam o build determinístico e sem depender da rede.
// Subconjunto latino (cobre os acentos de pt e es), peso variável — o mesmo de antes.
const archivo = localFont({
  src: "../../node_modules/@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2",
  variable: "--font-archivo",
  weight: "100 900",
  display: "swap",
});

const inter = localFont({
  src: "../../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
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
      <body>{children}</body>
    </html>
  );
}
