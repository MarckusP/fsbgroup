import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { logos } from "@/content/site";
import type { Dictionary, Locale } from "@/lib/dictionaries";

/**
 * Tela provisória de /events e /company.
 *
 * Existe só para os CTAs da home não levarem a lugar nenhum. A estrutura de pastas
 * já está no formato final para receber as seções §20/§21.
 */
export function SoonScreen({
  dict,
  lang,
  universe,
}: {
  dict: Dictionary;
  lang: Locale;
  universe: "events" | "company";
}) {
  const copy = dict.soon[universe];

  return (
    <main className="grain shell relative flex min-h-svh flex-col items-start justify-center gap-8 overflow-hidden bg-midnight-deep py-24">
      {/* Selo circular como textura de fundo — grande e apagado de propósito. */}
      <img
        src={logos.seal}
        alt=""
        aria-hidden
        width={440}
        height={445}
        className="pointer-events-none absolute -right-24 top-1/2 h-[min(70vw,34rem)] w-auto -translate-y-1/2 opacity-[0.04]"
      />

      <Link
        href={`/${lang}`}
        className="inline-flex items-center gap-2 text-sm text-bone/50 transition-colors hover:text-electric"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        {dict.soon.back}
      </Link>

      <p className="type-eyebrow text-electric">{dict.soon.badge}</p>

      <h1 className="type-display text-[clamp(3rem,12vw,9rem)]">{copy.title}</h1>

      <p className="max-w-xl text-balance text-base leading-relaxed text-bone/60 md:text-lg">
        {copy.text}
      </p>
    </main>
  );
}
