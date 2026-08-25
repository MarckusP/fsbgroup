import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Reveal } from "@/components/ui/Reveal";
import { poolBySection, SECTIONS, type Universe } from "@/content/media-pool";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import { UniverseContactSection } from "./UniverseContactSection";
import { UniverseStage, type StageSection } from "./UniverseStage";

/**
 * Resolve as seções de um universo com a mídia já filtrada e a copy já no idioma certo.
 *
 * Ramifica em vez de usar genéricos: `dict.events`/`dict.company` e `SECTIONS.events`/
 * `SECTIONS.company` já são fortemente tipados um para o outro, então dois branches
 * concretos são mais simples — e mais seguros — do que fazer `UniverseStage` carregar um
 * parâmetro de tipo por causa disto.
 */
function buildSections(universe: Universe, dict: Dictionary): StageSection[] {
  if (universe === "events") {
    return SECTIONS.events.map((slug) => ({
      slug,
      copy: dict.events.sections[slug],
      media: poolBySection("events", slug),
    }));
  }
  return SECTIONS.company.map((slug) => ({
    slug,
    copy: dict.company.sections[slug],
    media: poolBySection("company", slug),
  }));
}

/**
 * Página real de /company e /events (substitui a antiga `SoonScreen`).
 *
 * Sem `Curtain`/`IntroProvider`: essas páginas não têm abertura em vídeo, então o
 * conteúdo pode simplesmente existir — nada para revelar depois de um trailer.
 */
export function UniversePage({
  universe,
  dict,
  lang,
}: {
  universe: Universe;
  dict: Dictionary;
  lang: Locale;
}) {
  const copy = dict[universe];
  const sections = buildSections(universe, dict);

  return (
    <>
      <Header dict={dict} lang={lang} />

      <main className="relative min-h-svh bg-midnight-deep pb-24 pt-20">
        {/* Camada decorativa à parte (não ancestral do conteúdo): o glow do
            `stage-ambient` precisa de `overflow-hidden` pra não vazar pelas bordas
            (`inset: -10%`), mas isso quebra `position: sticky` em qualquer descendente —
            por isso vive num irmão do conteúdo, não como classe do próprio `main`. */}
        <div
          aria-hidden
          className="stage-ambient grain pointer-events-none absolute inset-0 overflow-hidden"
        />

        <div className="relative z-10 flex flex-col pl-[5vw] pr-[6vw] lg:pl-12 lg:pr-20">
          {/* Ocupa a página inteira de propósito: o formulário vive DEPOIS deste bloco,
              então ele nunca aparece ao lado das seções enquanto a pessoa navega entre
              elas — só surge quando ela rola pra baixo de propósito, como último item.
              Sem `justify-center`: o conteúdo começa colado no topo (logo abaixo da
              navbar) e é o espaço sobrando embaixo, antes do formulário, que absorve a
              diferença — centralizar teria empurrado o início pra baixo também. */}
          <div className="flex min-h-svh flex-col gap-10">
            <div className="flex flex-col items-start gap-4">
              <Link
                href={`/${lang}`}
                className="inline-flex items-center gap-2 text-sm text-bone/50 transition-colors hover:text-electric"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                {dict.nav.back}
              </Link>

              <Reveal className="flex flex-col items-start gap-5">
                {/* Este é o eyebrow de topo da própria página (não o de uma seção) —
                    maior que o `.type-eyebrow` padrão (11px) de propósito, pra marcar
                    que é o título do universo inteiro, não um rótulo secundário. */}
                <p className="font-display text-base font-semibold uppercase tracking-[0.35em] text-electric md:text-lg">
                  {copy.eyebrow}
                </p>
                <h1 className="type-display text-[clamp(2.25rem,4.5vw,3.75rem)] text-bone">
                  {copy.title}
                </h1>
                <p className="max-w-xl text-balance text-base leading-relaxed text-bone/60 md:text-lg">
                  {copy.intro}
                </p>
              </Reveal>
            </div>

            <UniverseStage sections={sections} />
          </div>

          <UniverseContactSection formTypeLabel={copy.formTypeLabel} form={dict.form} />
        </div>
      </main>

      <Footer dict={dict} />
    </>
  );
}
