import { notFound } from "next/navigation";
import { CinemaBackdrop } from "@/components/hero/CinemaBackdrop";
import { HeroSection } from "@/components/hero/HeroSection";
import { PathSelector } from "@/components/path/PathSelector";
import { FilmSection } from "@/components/sections/FilmSection";
import { FinalPaths } from "@/components/sections/FinalPaths";
import { VisionSection } from "@/components/sections/VisionSection";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { getDictionary, isLocale } from "@/lib/dictionaries";

/**
 * Home — IMPACTO → IDENTIDADE → ESCOLHA → EXPLICAÇÃO (§27).
 *
 * O vídeo do hero (CinemaBackdrop) já entra tocando como fundo — sem abertura em tela
 * cheia bloqueando o resto da página primeiro.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-electric focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {dict.nav.skipToContent}
      </a>

      <Header dict={dict} lang={lang} />

      <CinemaBackdrop dict={dict} />

      <main>
        <HeroSection dict={dict} />
        <PathSelector dict={dict} lang={lang} />
        <FilmSection dict={dict} />
        <VisionSection dict={dict} />
        <FinalPaths dict={dict} lang={lang} />
      </main>

      <Footer dict={dict} />
    </>
  );
}
