"use client";

import { useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import type { PoolItem } from "@/content/media-pool";
import type { SectionCopy } from "@/content/dictionaries/types";
import { useSectionWheelNav } from "@/hooks/useSectionWheelNav";
import { Reveal } from "@/components/ui/Reveal";
import { UniverseMediaGrid } from "./UniverseMediaGrid";
import { UniverseSectionNav } from "./UniverseSectionNav";

export type StageSection = {
  readonly slug: string;
  readonly copy: SectionCopy;
  readonly media: readonly PoolItem[];
};

/**
 * Nav lateral + coluna de informação + grade de mídia da seção ativa.
 *
 * A troca de seção tem dois caminhos: clique na `UniverseSectionNav` (sempre disponível,
 * é o caminho acessível) e scroll do mouse sobre o próprio stage (`useSectionWheelNav`,
 * reforço para quem já está com o cursor em cima do conteúdo — desligado com
 * `prefers-reduced-motion` e sem efeito em touch, que não dispara `wheel`).
 */
export function UniverseStage({
  sections,
}: {
  sections: readonly StageSection[];
}) {
  const [index, setIndex] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const active = sections[index];

  useSectionWheelNav({
    containerRef: stageRef,
    index,
    count: sections.length,
    onChange: setIndex,
    enabled: !reduceMotion,
  });

  return (
    <div
      ref={stageRef}
      className="grid gap-12 md:grid-cols-[10rem_1fr_1.5fr] md:gap-14 lg:grid-cols-[12rem_1fr_1.6fr] lg:gap-16"
    >
      <UniverseSectionNav
        sections={sections.map((section) => ({ slug: section.slug, label: section.copy.navLabel }))}
        activeIndex={index}
        onSelect={setIndex}
      />

      <Reveal key={active.slug} className="flex flex-col items-start gap-6">
        <p className="type-eyebrow text-electric">{active.copy.eyebrow}</p>
        <h2 className="type-display text-[clamp(2rem,3.6vw,2.75rem)] text-bone">
          {active.copy.title}
        </h2>
        <p className="max-w-md text-balance text-sm leading-relaxed text-bone/65 md:text-base">
          {active.copy.description}
        </p>
      </Reveal>

      <div key={`${active.slug}-grid`}>
        <UniverseMediaGrid media={active.media} />
      </div>
    </div>
  );
}
