"use client";

/**
 * Barra vertical de seções de /company e /events.
 *
 * É a navegação primária e acessível — botões reais, focáveis, com `aria-current`. O
 * scroll do mouse (`useSectionWheelNav`, em `UniverseStage`) é só um reforço por cima
 * disto, nunca o único jeito de trocar de seção.
 */
export function UniverseSectionNav({
  sections,
  activeIndex,
  onSelect,
}: {
  sections: readonly { slug: string; label: string }[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav aria-label="Seções" className="flex flex-row flex-wrap gap-x-8 gap-y-3 md:flex-col md:flex-nowrap md:gap-5">
      {sections.map((section, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={section.slug}
            type="button"
            aria-current={active ? "true" : undefined}
            onClick={() => onSelect(index)}
            className={`group relative flex items-center gap-3 py-1.5 text-left transition-colors duration-500 ${
              active ? "text-bone" : "text-bone/40 hover:text-bone/70"
            }`}
          >
            <span
              aria-hidden
              className={`h-px w-6 shrink-0 bg-electric transition-all duration-500 ${
                active ? "opacity-100" : "w-3 opacity-0 group-hover:w-4 group-hover:opacity-60"
              }`}
            />
            {/* Não usa `.type-eyebrow` (fica em 11px, pequeno demais aqui) — mesmo
                estilo de rótulo, escrito por extenso pra garantir o tamanho maior
                sem depender da ordem de cascata entre utilitário custom e do Tailwind. */}
            <span className="font-display text-xs font-semibold uppercase tracking-[0.3em]">
              {section.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
