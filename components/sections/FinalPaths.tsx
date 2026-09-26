import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { PathCopy } from "@/content/dictionaries/types";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import { PathDivider } from "../path/PathDivider";
import { SplitBackdrop } from "../path/SplitBackdrop";
import { Reveal } from "../ui/Reveal";

/** §19 — os dois caminhos de novo, agora como decisão de saída. */
export function FinalPaths({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: Locale;
}) {
  return (
    <section className="shell relative z-10 bg-midnight-deep pb-28 md:pb-40">
      <Reveal>
        <h2 className="type-display mb-12 text-[clamp(2rem,6vw,5rem)]">
          {dict.finalPaths.title}
        </h2>
      </Reveal>

      {/* Mesmo tratamento do §7–8: página partida em duas metades atrás dos cards
          (SplitBackdrop) e coluna "auto" central só com o fio divisório, que colapsa
          junto com o grid pra 1 coluna no mobile (card, fio horizontal, card). */}
      <div className="relative isolate py-16 md:py-24">
      <SplitBackdrop />
      <div className="grid gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-x-16 lg:gap-x-28">
        <FinalPathCard copy={dict.finalPaths.events} href={`/${lang}/events`} />
        <PathDivider />
        <FinalPathCard
          copy={dict.finalPaths.company}
          href={`/${lang}/company`}
          delay={0.08}
        />
      </div>
      </div>
    </section>
  );
}

function FinalPathCard({
  copy,
  href,
  delay = 0,
}: {
  copy: PathCopy;
  href: string;
  delay?: number;
}) {
  return (
    // O fundo opaco fica FORA do Reveal: o Reveal anima opacidade, e se ele carregasse
    // o fundo, a célula ficaria transparente durante a entrada.
    <div className="h-full rounded-[24px] bg-midnight-deep">
      <Reveal delay={delay} className="h-full">
        <Link
          href={href}
          className="group flex h-full min-h-[16rem] flex-col justify-between gap-10 rounded-[24px] p-8 ring-1 ring-bone/10 transition duration-500 hover:-translate-y-1 hover:bg-electric/8 hover:ring-electric/40 md:min-h-[20rem] md:p-12"
        >
          <div className="space-y-4">
            <h3 className="type-display text-[clamp(2.25rem,5vw,3.75rem)] text-bone transition-colors group-hover:text-electric">
              {copy.name}
            </h3>
            <p className="max-w-sm text-sm leading-relaxed text-bone/60 md:text-base">
              {copy.tagline}
            </p>
          </div>
          <span className="inline-flex items-center gap-3 text-sm font-medium text-bone">
            {copy.cta}
            <ArrowRight
              className="h-4 w-4 text-electric transition-transform duration-500 group-hover:translate-x-1.5"
              strokeWidth={1.5}
            />
          </span>
        </Link>
      </Reveal>
    </div>
  );
}
