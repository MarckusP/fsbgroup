"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useMemo, useRef, useState } from "react";
import type { PoolItem } from "@/content/media-pool";
import type { Dictionary, SectionCopy } from "@/content/dictionaries/types";
import { useArcScrub } from "@/hooks/useArcScrub";
import {
  arcItems,
  ArcRail,
  ARC_BOX,
  UniverseMediaArc,
  type ArcFrame,
  type ArcHandle,
} from "./UniverseMediaArc";
import { textBlockExit, textLine } from "./stageMotion";
import { UniverseSectionNav } from "./UniverseSectionNav";

export type StageSection = {
  readonly slug: string;
  readonly copy: SectionCopy;
  readonly media: readonly PoolItem[];
};

/**
 * Coluna de informação + faixa de seções e carrossel em arco.
 *
 * A galeria é UMA FITA CONTÍNUA. Todas as seções entram numa lista só (`frames`), montada
 * uma vez: as seções são faixas dentro dela, não galerias separadas. Chegando ao fim das
 * imagens de uma seção, as vagas à direita do arco já estão ocupadas pelas primeiras da
 * seguinte — a fita não acaba nem recomeça, e a seção ativa é simplesmente a do quadro que
 * está no centro.
 *
 * Disso decorre o resto do desenho:
 *
 * - o estado é um número só (`frameIndex`), não mais um par seção+imagem;
 * - o arco NÃO remonta na troca de seção — remontá-lo é justamente o que cortava a fila;
 * - todo caminho de navegação vira o mesmo movimento: scroll, arrasto do dedo, clique num
 *   quadro lateral,
 *   botões de seção e a faixa de seções apenas pedem um alvo (`goTo`) e a fita desliza até
 *   lá. `frameIndex` é SAÍDA do laço, nunca entrada — ver a nota sobre o dono da posição em
 *   `useArcScrub`;
 * - só o TEXTO troca com corte suave (ver `stageMotion.ts`), quando o destaque cruza a
 *   fronteira entre duas seções.
 *
 * A faixa de seções é o único atalho entre seções: clicar num rótulo é um salto para o
 * primeiro quadro daquela seção, e a fita desliza até lá. Rolar e arrastar cobrem o resto,
 * quadro a quadro.
 */
export function UniverseStage({
  sections,
  stage,
}: {
  sections: readonly StageSection[];
  stage: Dictionary["stage"];
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const arcBoxRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<ArcHandle>(null);
  const reduceMotion = useReducedMotion();

  // A fita achatada, e os limites de cada seção dentro dela. `sections` vem de um Server
  // Component, então é estável entre renders do cliente.
  const { frames, firstOf } = useMemo(() => {
    const list: ArcFrame[] = [];
    const first: number[] = [];
    sections.forEach((section, sectionIndex) => {
      first[sectionIndex] = list.length;
      arcItems(section.media).forEach((item, indexInSection) => {
        list.push({ item, sectionIndex, numberInSection: indexInSection + 1 });
      });
    });
    return { frames: list, firstOf: first };
  }, [sections]);

  const [frameIndex, setFrameIndex] = useState(0);
  const sectionIndex = frames[frameIndex].sectionIndex;
  const active = sections[sectionIndex];

  // O laço de animação escreve direto no DOM do arco (`applyFrame`), sem passar pelo
  // estado do React: a posição é contínua e muda a cada frame enquanto a pessoa rola.
  const applyFrame = useCallback((position: number) => {
    arcRef.current?.applyFrame(position);
  }, []);

  const { goTo } = useArcScrub({
    containerRef: stageRef,
    dragRef: arcBoxRef,
    frameCount: frames.length,
    onNavigate: setFrameIndex,
    onFrame: applyFrame,
    enabled: !reduceMotion,
  });

  // Recriar estes objetos a cada render faria o `motion` reavaliar a animação em curso;
  // `reduceMotion` é a única coisa que os muda.
  const reduce = !!reduceMotion;
  const blockExit = useMemo(() => textBlockExit(reduce), [reduce]);
  const lines = useMemo(
    () => [0, 1, 2].map((index) => textLine(reduce, index)),
    [reduce],
  );

  return (
    // O `ref` do wheel fica neste wrapper, e não na grade: é o retângulo dele que a guarda
    // de `useArcScrub` mede para decidir entre mover a fita e devolver o scroll à página.
    <div ref={stageRef}>
      <div className="grid gap-12 md:grid-cols-[1fr_1.9fr] md:gap-14 lg:grid-cols-[1fr_2fr] lg:gap-16">
        {/* `grid` com os dois blocos na MESMA célula (`gridArea: 1/1`) — não `absolute`:
            empilhados assim, a célula mede o mais alto dos dois durante a sobreposição e
            nunca colapsa a zero. Se colapsasse, a altura do stage mudaria no meio da troca
            e a guarda de `useArcScrub` devolveria o scroll ao navegador — a página desceria
            até o formulário. */}
        <div className="grid">
          {/* Sem `initial={false}`: a primeira seção também entra animada, no lugar do
              `Reveal` que o bloco usava antes — e agora em cascata, junto com o arco. */}
          <AnimatePresence>
            {/* Só a SAÍDA vive no bloco (as três linhas partem juntas). A entrada é de
                cada linha, com o atraso da cascata vindo de `textLine`. */}
            <motion.div
              key={active.slug}
              style={{ gridArea: "1 / 1" }}
              className="flex flex-col items-start gap-6"
              {...blockExit}
            >
              <motion.p {...lines[0]} className="type-eyebrow text-electric">
                {active.copy.eyebrow}
              </motion.p>
              <motion.h2
                {...lines[1]}
                className="type-display text-[clamp(2rem,3.6vw,2.75rem)] text-bone"
              >
                {active.copy.title}
              </motion.h2>
              <motion.p
                {...lines[2]}
                className="max-w-md text-balance text-sm leading-relaxed text-bone/65 md:text-base"
              >
                {active.copy.description}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-6">
          {/* A nav é irmã do arco, e fora do `AnimatePresence` abaixo: ela é chrome
              permanente e não pode remontar (nem reanimar o sublinhado) a cada troca
              de seção. O sublinhado correndo de um rótulo ao outro é justamente o fio
              contínuo que costura a saída de uma seção à entrada da outra. */}
          <UniverseSectionNav
            label={stage.sections}
            sections={sections.map((section) => ({
              slug: section.slug,
              label: section.copy.navLabel,
            }))}
            activeIndex={sectionIndex}
            onSelect={(target) => goTo(firstOf[target])}
          />

          {/* A caixa carrega a altura, o `--arc-base` e o recorte (ver `ARC_BOX`), e
              hospeda o trilho junto do arco. Nada aqui remonta na troca de seção: é essa
              permanência que faz a fita ser contínua. */}
          {/* `touch-action: none`: o arrasto do dedo sobre o arco é nosso (ver o bloco de
              touch em `useArcScrub`). Sem isto o navegador começa a rolar a página antes
              do primeiro `touchmove` e o gesto nunca chega ao carrossel. */}
          <div
            ref={arcBoxRef}
            className={`relative touch-none overflow-hidden ${ARC_BOX}`}
          >
            <ArcRail />

            <UniverseMediaArc
              ref={arcRef}
              frames={frames}
              activeIndex={frameIndex}
              onSelect={goTo}
              galleryLabel={stage.gallery}
              imageLabel={stage.showImage}
              openSiteLabel={stage.openSite}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
