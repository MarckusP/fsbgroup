"use client";

/**
 * Faixa horizontal de seções de /company e /events, centralizada logo acima da galeria.
 *
 * É a navegação primária e acessível — botões reais, focáveis, com `aria-current`. O
 * scroll do mouse (`useArcScrub`, em `UniverseStage`) é só um reforço por cima disto,
 * nunca o único jeito de trocar de seção.
 *
 * Clicar aqui não corta a galeria: escolhe um alvo na fita contínua e ela desliza até lá,
 * o mesmo movimento que o scroll faz. O sublinhado correndo de um rótulo ao outro é o que
 * marca a troca enquanto a fita ainda está em movimento.
 *
 * O destaque da seção ativa é um sublinhado que cresce sob o rótulo, não o traço lateral
 * de quando isto era uma coluna: na horizontal, um traço à esquerda de cada item lê como
 * separador entre rótulos, não como marcador do ativo.
 */
export function UniverseSectionNav({
  label,
  sections,
  activeIndex,
  onSelect,
}: {
  /** `aria-label` da barra — vem do dicionário, como todo texto do site. */
  label: string;
  sections: readonly { slug: string; label: string }[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav
      aria-label={label}
      className="flex flex-row flex-wrap items-end justify-center gap-x-7 gap-y-2 sm:gap-x-9"
    >
      {sections.map((section, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={section.slug}
            type="button"
            aria-current={active ? "true" : undefined}
            onClick={() => onSelect(index)}
            className={`group relative pb-2 text-left transition-colors duration-500 ${
              active ? "text-bone" : "text-bone/40 hover:text-bone/70"
            }`}
          >
            {/* Não usa `.type-eyebrow` (fica em 11px, pequeno demais aqui) — mesmo
                estilo de rótulo, escrito por extenso pra garantir o tamanho maior
                sem depender da ordem de cascata entre utilitário custom e do Tailwind. */}
            <span className="font-display text-xs font-semibold uppercase tracking-[0.28em]">
              {section.label}
            </span>

            {/* Ancorado à esquerda e crescendo em largura (não um `scaleX` a partir do
                centro): o sublinhado "corre" sob o rótulo no sentido da leitura. */}
            <span
              aria-hidden
              className={`absolute bottom-0 left-0 h-px bg-electric transition-all duration-500 ease-[var(--ease-hover)] ${
                active
                  ? "w-full opacity-100"
                  : "w-0 opacity-0 group-hover:w-1/3 group-hover:opacity-60"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
