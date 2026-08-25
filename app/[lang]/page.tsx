import { notFound } from "next/navigation";
import { CinemaBackdrop } from "@/components/hero/CinemaBackdrop";
import { HeroSection } from "@/components/hero/HeroSection";
import { IntroCurtain } from "@/components/hero/IntroCurtain";
import { IntroProvider } from "@/components/hero/IntroProvider";
import { PathSelector } from "@/components/path/PathSelector";
import { FilmSection } from "@/components/sections/FilmSection";
import { FinalPaths } from "@/components/sections/FinalPaths";
import { VisionSection } from "@/components/sections/VisionSection";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Curtain } from "@/components/ui/Curtain";
import { getDictionary, isLocale } from "@/lib/dictionaries";

/**
 * Home — ABERTURA → IMPACTO → IDENTIDADE → ESCOLHA → EXPLICAÇÃO (§3, §27).
 *
 * CinemaBackdrop fica fora do fluxo E fora da cortina: durante a abertura ele é a tela
 * inteira, depois vira o vídeo `fixed` que atravessa o Hero e a seção de escolha. Todo o
 * resto entra escalonado quando o trailer termina — sem desmontar nada, só opacidade,
 * para que o HTML servido continue completo.
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
    <IntroProvider>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-electric focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        {dict.nav.skipToContent}
      </a>

      <Curtain lift={false}>
        <Header dict={dict} lang={lang} />
      </Curtain>

      <CinemaBackdrop dict={dict} />

      <Curtain delay={180}>
        <main>
          <HeroSection dict={dict} />
          <PathSelector dict={dict} lang={lang} />
          <FilmSection dict={dict} />
          <VisionSection dict={dict} />
          <FinalPaths dict={dict} lang={lang} />
        </main>
      </Curtain>

      <Curtain delay={320}>
        <Footer dict={dict} />
      </Curtain>

      <IntroCurtain dict={dict} />
    </IntroProvider>
  );
}
