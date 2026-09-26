import type { Dictionary, Locale } from "@/lib/dictionaries";
import { PathCard } from "./PathCard";
import { PathDivider } from "./PathDivider";

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
      <header className="shell mb-10 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="type-eyebrow text-electric">{dict.paths.eyebrow}</h2>
        <p className="type-eyebrow hidden text-bone/35 md:block">
          {dict.paths.hint}
        </p>
      </header>

      {/* Com respiro dos dois lados o vídeo do hero aparece EM VOLTA dos cards — é o
          que os faz ler como dois objetos soltos acima da página, e não como duas
          metades dela. A coluna "auto" do meio carrega só o fio divisório — no
          mobile o grid cai pra 1 coluna e os três itens empilham (card, fio
          horizontal, card), sem precisar de nenhuma classe condicional aqui. */}
      <div className="shell grid gap-10 md:grid-cols-[1fr_auto_1fr] md:gap-x-12 lg:gap-x-16">
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
    </section>
  );
}
