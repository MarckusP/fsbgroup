import type { Dictionary, Locale } from "@/lib/dictionaries";
import { PathCard } from "./PathCard";

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
          metades dela. */}
      <div className="shell grid gap-6 md:grid-cols-2 lg:gap-10">
        <PathCard
          universe="events"
          copy={dict.paths.events}
          href={`/${lang}/events`}
        />
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
