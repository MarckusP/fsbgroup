"use client";

import { ArrowDown } from "lucide-react";
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

/** Tempo pra fita chegar à última imagem antes de a página descer ao formulário — o laço
 *  de `useArcScrub` atravessa a fita inteira em ~0,9 s; aqui a descida já começa no fim
 *  do glide, sem esperar o assentamento completo. */
const QUOTE_SCROLL_DELAY_MS = 750;

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
    <>
    {/* O `ref` do wheel fica neste wrapper: é o retângulo dele que a guarda de
        `useArcScrub` mede para decidir entre mover a fita e devolver o scroll à página.
        Tudo empilhado e centralizado — seções no topo, o texto da seção, e a galeria. */}
    <div ref={stageRef} className="flex flex-col items-center gap-6 md:gap-8">
      {/* A nav é chrome permanente, fora do `AnimatePresence` abaixo: não pode remontar
          (nem reanimar o sublinhado) a cada troca de seção. O sublinhado correndo de um
          rótulo ao outro é o fio contínuo que costura a saída de uma seção à entrada da
          outra. */}
      <UniverseSectionNav
        label={stage.sections}
        sections={sections.map((section) => ({
          slug: section.slug,
          label: section.copy.navLabel,
        }))}
        activeIndex={sectionIndex}
        onSelect={(target) => goTo(firstOf[target])}
      />

      {/* `grid` com os dois blocos na MESMA célula (`gridArea: 1/1`) — não `absolute`:
          empilhados assim, a célula mede o mais alto dos dois durante a sobreposição e
          nunca colapsa a zero. Se colapsasse, a altura do stage mudaria no meio da troca
          e a guarda de `useArcScrub` devolveria o scroll ao navegador. */}
      <div className="grid w-full max-w-3xl">
        {/* Sem `initial={false}`: a primeira seção também entra animada, em cascata. */}
        <AnimatePresence>
          {/* Só a SAÍDA vive no bloco (as três linhas partem juntas). A entrada é de
              cada linha, com o atraso da cascata vindo de `textLine`. */}
          <motion.div
            key={active.slug}
            style={{ gridArea: "1 / 1" }}
            className="flex flex-col items-center gap-3 text-center md:gap-4"
            {...blockExit}
          >
            <motion.p {...lines[0]} className="type-eyebrow text-electric">
              {active.copy.eyebrow}
            </motion.p>
            {/* Mais compacto que na grade antiga: empilhado, o texto divide a altura da
                tela com o arco (ver a reserva em `ARC_BOX`). */}
            <motion.h2
              {...lines[1]}
              className="type-display text-balance text-[clamp(1.6rem,2.8vw,2.25rem)] text-bone"
            >
              {active.copy.title}
            </motion.h2>
            <motion.p
              {...lines[2]}
              className="max-w-2xl text-balance text-sm leading-relaxed text-bone/65 md:text-base"
            >
              {active.copy.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* A caixa carrega a altura, o `--arc-base` e o recorte (ver `ARC_BOX`), e hospeda
          o trilho junto do arco. Nada aqui remonta na troca de seção: é essa permanência
          que faz a fita ser contínua. `touch-action: none`: o arrasto do dedo sobre o arco
          é nosso (ver `useArcScrub`); sem isto o navegador rola a página antes do primeiro
          `touchmove`. `cursor-grab` avisa quem usa mouse que o arco também se arrasta. */}
      <div
        ref={arcBoxRef}
        className={`relative w-full touch-none overflow-hidden cursor-grab active:cursor-grabbing ${ARC_BOX}`}
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
      {/* "Solicitar orçamento" logo abaixo da galeria, DENTRO do `stageRef`: a trava do
          wheel encaixa a página no stage inteiro, então galeria e botão ficam juntos na
          tela enquanto a fita anda (a reserva de altura em `ARC_BOX` já conta com ele).
          Entra subindo e crescendo ao aparecer; a seta balança pra baixo, apontando o
          formulário. O clique leva a fita até a última imagem e desce pro formulário; sem
          JS, o `href` já faz o salto. */}
      {/* A entrada (subir + crescer) vive no wrapper; o halo é IRMÃO do botão, atrás dele
          — dentro do botão, um filho com z negativo pinta por cima do próprio fundo e o
          reinício de cada ciclo aparecia como uma piscada. O ciclo do halo começa e
          termina invisível, então o recomeço não se vê. O hover também é do motion: uma
          transição de CSS em `transform` brigaria com o `transform` que ele escreve. */}
      <motion.div
        className="relative inline-flex"
        initial={reduce ? false : { opacity: 0, y: 28, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ type: "spring", stiffness: 180, damping: 18, delay: 0.15 }}
      >
        {!reduce && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full bg-electric"
            animate={{ scale: [1, 1.22], opacity: [0, 0.45, 0] }}
            transition={{ duration: 2, times: [0, 0.25, 1], repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <motion.a
          href="#orcamento"
          onClick={(event) => {
            event.preventDefault();
            goTo(frames.length - 1);
            const form = document.getElementById("orcamento");
            if (!form) return;
            window.setTimeout(
              () => form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }),
              reduce ? 0 : QUOTE_SCROLL_DELAY_MS,
            );
          }}
          whileHover={reduce ? undefined : { scale: 1.03 }}
          transition={{ duration: 0.25 }}
          className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/25 bg-electric px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-[0_0_0_1px_rgb(23_67_244/0.6),0_20px_50px_-10px_rgb(23_67_244/0.95)] transition-[background-color,box-shadow] duration-300 hover:bg-[#2a55ff] hover:shadow-[0_0_0_1px_rgb(23_67_244/0.8),0_24px_60px_-8px_rgb(23_67_244/1)] md:px-6 md:py-3 md:text-sm"
        >
          {stage.quoteCta}
          <motion.span
            aria-hidden
            className="inline-flex"
            animate={reduce ? undefined : { y: [0, 3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.25} />
          </motion.span>
        </motion.a>
      </motion.div>
    </div>
    </>
  );
}
