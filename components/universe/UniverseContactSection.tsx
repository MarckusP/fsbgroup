import { Reveal } from "@/components/ui/Reveal";
import type { Dictionary, Locale } from "@/content/dictionaries/types";
import type { Universe } from "@/content/media-pool";
import { LeadForm } from "./LeadForm";

/**
 * Seção de contato de /company e /events — uma vez só, depois de todas as seções do
 * `UniverseStage` (antes o formulário vivia dentro de cada seção e remontava a cada
 * troca de aba).
 *
 * O texto continua discreto (eyebrow/título pequenos, sem `type-display`), mas o
 * PAINEL ao redor é que dá destaque: gradiente + borda + glow na cor da marca, pra
 * marcar visualmente que isto é o encerramento da página, não mais uma seção igual
 * às anteriores.
 *
 * `id="orcamento"` é o alvo do botão "ir direto pro orçamento" no topo da página
 * (`UniversePage`) — um `<a href="#orcamento">` puro, sem JS. `scroll-mt-24` compensa o
 * cabeçalho fixo (`Header`, `~5rem`) pra o painel não pousar embaixo dele depois do salto.
 * O scroll suave (e a queda pra `auto` em `prefers-reduced-motion`) já vêm do `html` em
 * `globals.css` — não precisa de nada em JS aqui.
 */
export function UniverseContactSection({
  formTypeLabel,
  form,
  universe,
  locale,
}: {
  /** "Tipo de evento" (Events) ou "Tipo de projeto" (Company) — vem do universo. */
  formTypeLabel: string;
  form: Dictionary["form"];
  universe: Universe;
  locale: Locale;
}) {
  return (
    <section id="orcamento" className="relative scroll-mt-24 px-4 py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(23_67_244/0.25),transparent_70%)]"
      />
      <Reveal
        className="hairline mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-[32px] border bg-gradient-to-b from-electric/12 via-electric/[0.04] to-transparent px-6 py-12 text-center shadow-[0_50px_100px_-45px_rgb(23_67_244/0.55)] md:px-14 md:py-16"
      >
        <p className="type-eyebrow text-electric">{form.eyebrow}</p>
        <h2 className="text-balance text-lg font-medium text-bone/85 md:text-xl">
          {form.title}
        </h2>
        <LeadForm form={form} typeLabel={formTypeLabel} universe={universe} locale={locale} />
      </Reveal>
    </section>
  );
}
