"use client";

import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { PRELOAD_COUNT, type PoolItem } from "@/content/media-pool";
import { GlassMediaCard } from "./GlassMediaCard";

const identity = (item: PoolItem) => (item.kind === "video" ? item.mp4 : item.src);

/** Cada seção reserva 8 vagas na galeria — real onde já há mídia, placeholder (mesmo
 *  enquadramento "vidro", mas vazio) nas que faltam. Garante que toda seção mostre a
 *  galeria completa desde já, mesmo enquanto a curadoria de algumas ainda não chegou
 *  a 8 itens. */
const VISIBLE_COUNT = 8;
/** Base de 4 colunas só pra distribuir as posições — a galeria não é uma grade
 *  (ver `placementFor`), isto é só o ponto de partida antes do "espalhar". */
const COLS = 4;
const ROWS = Math.ceil(VISIBLE_COUNT / COLS);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export type CardPlacement = {
  leftPct: number;
  topPct: number;
  rotate: number;
  /** Escala de repouso — é o que dá profundidade: cards "de fundo" são menores. */
  scale: number;
  /** Brilho de repouso — cards "de fundo" são mais escuros, como se afastados na cena. */
  brightness: number;
  /** Desfoque de repouso, em px — só os "de fundo" pegam um pouco, como fora de foco. */
  blur: number;
  z: number;
};

/**
 * Posição, rotação e "profundidade" de cada vaga — determinístico por índice (não
 * aleatório a cada render, senão a galeria "pula" toda vez que o React re-renderiza).
 *
 * Em vez de uma grade de linhas/colunas, as vagas ficam soltas, próximas e misturadas
 * — como uma pilha de fotos espalhada sobre uma mesa: parte deterministicamente de uma
 * base de 4 colunas (só pra espalhar a posição inicial), soma um deslocamento (jitter)
 * também determinístico, e varia escala/brilho/desfoque por "camada" de profundidade
 * (fundo/meio/frente) — as de fundo ficam menores, mais escuras e um pouco desfocadas;
 * as da frente, maiores e nítidas, como se estivessem mais perto de quem olha.
 */
function placementFor(index: number): CardPlacement {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  // Base comprimida em 30%..70% nos dois eixos — a margem tem que caber o card não só
  // em repouso, mas também no tamanho do HOVER (bem maior); ver os multiplicadores de
  // `state === "active"` em `GlassMediaCard`/`PlaceholderMediaCard`, calibrados junto
  // com esta margem pra nunca furar a borda da moldura (que tem `overflow-hidden`).
  const baseLeft = 30 + (col / (COLS - 1)) * 40;
  const baseTop = 30 + (row / (ROWS - 1)) * 40;
  // Jitter reduzido na mesma proporção do espaçamento entre células — ainda maior
  // que o passo, pra misturar de verdade, mas dentro da margem de segurança menor.
  const jitterLeft = (((index * 53) % 13) - 6) * 1.0;
  const jitterTop = (((index * 31) % 11) - 5) * 1.35;

  const depthTier = (index * 17) % 3; // 0 fundo, 1 meio, 2 frente
  const scale = depthTier === 0 ? 0.82 : depthTier === 1 ? 0.96 : 1.08;
  const brightness = depthTier === 0 ? 0.72 : depthTier === 1 ? 0.9 : 1.04;
  const blur = depthTier === 0 ? 1.4 : 0;
  const z = 10 + depthTier * 12 + (index % 5);

  return {
    leftPct: clamp(baseLeft + jitterLeft, 30, 70),
    topPct: clamp(baseTop + jitterTop, 30, 70),
    rotate: (((index * 47) % 7) - 3) * 2.4,
    scale,
    brightness,
    blur,
    z,
  };
}

export function UniverseMediaGrid({ media }: { media: readonly PoolItem[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const slots = Array.from({ length: VISIBLE_COUNT }, (_, index) => media[index] ?? null);

  return (
    <div
      // `overflow-hidden` de propósito: os cards são posicionados livremente e podem
      // crescer bastante (camada "frente" + zoom do hover) — sem isso, um card perto
      // da borda inferior vazava visualmente pra fora da galeria, por cima da seção
      // seguinte (o formulário de contato). A altura em si (e a margem de 30% em
      // `placementFor`) foi calibrada pra caber o card no tamanho de HOVER, não só em
      // repouso — cortar durante o hover era exatamente o bug reportado antes.
      className="relative h-[14rem] w-full overflow-hidden sm:h-[16rem] lg:h-[18rem]"
      onPointerLeave={() => setHoveredId(null)}
    >
      {slots.map((item, index) => {
        const placement = placementFor(index);
        const id = item ? identity(item) : `placeholder-${index}`;
        const state = hoveredId === null ? "idle" : hoveredId === id ? "active" : "dim";
        const onHoverStart = () => setHoveredId(id);
        const onHoverEnd = () => setHoveredId((current) => (current === id ? null : current));

        if (!item) {
          return (
            <PlaceholderMediaCard
              key={id}
              state={state}
              placement={placement}
              onHoverStart={onHoverStart}
              onHoverEnd={onHoverEnd}
            />
          );
        }

        return (
          <GlassMediaCard
            key={id}
            item={item}
            state={state}
            placement={placement}
            eager={index < PRELOAD_COUNT}
            onHoverStart={onHoverStart}
            onHoverEnd={onHoverEnd}
          />
        );
      })}
    </div>
  );
}

/**
 * Vaga ainda sem mídia — mesmo posicionamento/profundidade de repouso de um
 * `GlassMediaCard` (pra pertencer à mesma "pilha"), com hover próprio: a borda
 * tracejada vira sólida na cor da marca e o ícone clareia, em vez de ficar inerte
 * enquanto os cards reais ao redor respondem ao mouse.
 */
function PlaceholderMediaCard({
  state,
  placement,
  onHoverStart,
  onHoverEnd,
}: {
  state: "active" | "dim" | "idle";
  placement: CardPlacement;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const scale =
    state === "active"
      ? placement.scale * 1.22
      : state === "dim"
        ? placement.scale * 0.92
        : placement.scale;
  const rotate = state === "active" ? 0 : placement.rotate;
  const filter =
    state === "dim"
      ? `blur(${placement.blur + 1.5}px) brightness(${placement.brightness * 0.7})`
      : `blur(${placement.blur}px) brightness(${placement.brightness})`;

  return (
    <div
      aria-hidden
      onPointerEnter={onHoverStart}
      onPointerLeave={onHoverEnd}
      style={{
        left: `${placement.leftPct}%`,
        top: `${placement.topPct}%`,
        zIndex: state === "active" ? 60 : placement.z,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
        filter,
        // Mesma curva simétrica do `GlassMediaCard` — suave entrando e saindo do
        // hover, não só na entrada (`--ease-cinema` é assimétrica de propósito).
        transitionProperty: "transform, filter, border-color, background-color",
        transitionDuration: "650ms",
        transitionTimingFunction: "var(--ease-hover)",
      }}
      className={`absolute flex aspect-square w-[5.76rem] items-center justify-center rounded-[24px] border border-dashed sm:w-[6.72rem] lg:w-[7.68rem] ${
        state === "active" ? "border-electric/50 bg-electric/[0.06]" : "border-bone/15 bg-bone/[0.02]"
      }`}
    >
      <ImagePlus
        className={`h-4 w-4 transition-colors duration-[650ms] ease-[var(--ease-hover)] ${
          state === "active" ? "text-electric/70" : "text-bone/15"
        }`}
        strokeWidth={1.5}
      />
    </div>
  );
}
