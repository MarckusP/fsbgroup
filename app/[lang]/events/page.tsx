import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UniversePage } from "@/components/universe/UniversePage";
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
    title: `${dict.events.title} — ${dict.meta.title}`,
    description: dict.events.intro,
  };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <UniversePage dict={getDictionary(lang)} lang={lang} universe="events" />;
}
