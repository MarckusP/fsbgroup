import type { Dictionary, Locale } from "@/lib/dictionaries";
import { PathCard } from "./PathCard";
import { PathDivider } from "./PathDivider";
import { SplitBackdrop } from "./SplitBackdrop";

/** §7–8 — os dois universos, 50/50 no desktop e empilhados no mobile. */
export function PathSelector({
  dict,
  lang,
}: {
  dict: Dictionary;
  lang: Locale;
}) {
  return (
    <section className="relative z-10 flex min-h-svh flex-col justify-center py-20">
      {/* Centralizado: o título é o mesmo eyebrow elétrico de antes, só maior; a dica
          fica logo abaixo, no tamanho e na cor originais. Fala de mouse, então fica fora
          no touch. */}
      <header className="shell mb-10 flex flex-col items-center gap-3 text-center">
        {/* Mesmo eyebrow elétrico, em tamanho de título (~5x os 11px originais); o tracking
            cai de 0.4em pra 0.12em porque, grande assim, o espaçamento original desmancharia
            a frase. O `!` é obrigatório: `.type-eyebrow` mora na mesma camada `utilities`
            e é declarado DEPOIS das classes do Tailwind em globals.css, então sem ele o
            tamanho e o tracking dele venceriam — foi o que deixou o título em 11px. */}
        <h2 className="type-eyebrow text-[clamp(1.75rem,6vw,3.5rem)]! leading-tight tracking-[0.12em]! text-electric">
          {dict.paths.eyebrow}
        </h2>
        <p className="type-eyebrow hidden text-bone/35 md:block">
          {dict.paths.hint}
        </p>
      </header>

      {/* A página partida em duas metades atrás dos cards (SplitBackdrop): azul em
          Events, grafite em Company. A coluna "auto" do meio carrega só o fio divisório,
          bem na divisa das cores — no mobile o grid cai pra 1 coluna e os três itens
          empilham (card, fio horizontal, card). */}
      <div className="relative isolate py-20 md:py-28">
      <SplitBackdrop />
      <div className="shell grid gap-14 md:grid-cols-[1fr_auto_1fr] md:gap-x-20 lg:gap-x-32">
        <PathCard
          universe="events"
          copy={dict.paths.events}
          href={`/${lang}/events`}
        />
        <PathDivider />
        <PathCard
          universe="company"
          copy={dict.paths.company}
          href={`/${lang}/company`}
          floatDelay="-3.5s"
        />
      </div>
      </div>
    </section>
  );
}
