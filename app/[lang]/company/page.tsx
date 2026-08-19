import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SoonScreen } from "@/components/sections/SoonScreen";
import { getDictionary, isLocale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return {
    title: `${dict.soon.company.title} — ${dict.soon.badge}`,
    description: dict.soon.company.text,
    // Página ainda sem conteúdo real: não faz sentido indexar.
    robots: { index: false, follow: true },
  };
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <SoonScreen dict={getDictionary(lang)} lang={lang} universe="company" />;
}
