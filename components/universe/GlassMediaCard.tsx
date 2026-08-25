"use client";

import { Play } from "lucide-react";
import type { PoolItem } from "@/content/media-pool";
import type { CardPlacement } from "./UniverseMediaGrid";

/** Raio da mídia interna — um pouco menor que o da moldura (`30px` em `.glass`),
 *  senão o "vidro" ao redor não lê como uma beirada. */
const MEDIA_RADIUS = 16;

/**
 * Um quadro "liquid glass" na galeria de uma seção — posicionado livremente (não numa
 * grade de linhas/colunas) pra ler como uma pilha de fotos espalhada, com profundidade:
 * `placement.scale`/`brightness`/`blur` (calculados por `UniverseMediaGrid`) fazem
 * cards "de fundo" ficarem menores, mais escuros e levemente desfocados, e os "da
 * frente" maiores e nítidos.
 *
 * No hover/foco o card gira pra 0°, cresce bem além do próprio tamanho de repouso e
 * sobe pro `z-index` mais alto — abre como uma janela por cima dos outros, que
 * encolhem e escurecem um pouco para dar contraste (`glass-dim`, calculado aqui, não
 * na classe, porque o desfoque de profundidade de repouso precisa se somar ao do dim).
 */
export function GlassMediaCard({
  item,
  state,
  placement,
  eager = false,
  onHoverStart,
  onHoverEnd,
}: {
  item: PoolItem;
  state: "active" | "dim" | "idle";
  placement: CardPlacement;
  eager?: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const asVideo = item.kind === "video" && state === "active";
  const posterSrc = item.kind === "video" ? item.poster : item.src;

  // 1.28, não maior: a margem de segurança da posição (30% em `placementFor`) e a
  // altura do container em `UniverseMediaGrid` foram calibradas pra este valor —
  // multiplicadores maiores voltam a cortar um card perto da borda no hover.
  const scale =
    state === "active"
      ? placement.scale * 1.28
      : state === "dim"
        ? placement.scale * 0.9
        : placement.scale;
  const rotate = state === "active" ? 0 : placement.rotate;
  const filter =
    state === "active"
      ? "brightness(1.08)"
      : state === "dim"
        ? `blur(${placement.blur + 1.6}px) brightness(${placement.brightness * 0.72}) saturate(0.85)`
        : `blur(${placement.blur}px) brightness(${placement.brightness})`;

  return (
    <div
      onPointerEnter={onHoverStart}
      onPointerLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
      tabIndex={0}
      style={{
        // Inline, não via classe Tailwind `absolute`: `.glass` já define
        // `position: relative` no CSS global, e a ordem de cascata entre um utilitário
        // custom e um do próprio Tailwind não é garantida — inline sempre vence.
        position: "absolute",
        left: `${placement.leftPct}%`,
        top: `${placement.topPct}%`,
        zIndex: state === "active" ? 60 : placement.z,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
        filter,
        // Idem: `.glass` já define seu próprio `transition` (shorthand, só
        // box-shadow/filter) — como shorthand substitui tudo, declarar de novo via
        // classe Tailwind vira loteria de cascata. Inline garante que os três (mais
        // suaves e simétricos que `--ease-cinema`, feita pra reveal de uma via só)
        // realmente transicionem entrando E saindo do hover.
        transitionProperty: "transform, filter, box-shadow",
        transitionDuration: "650ms",
        transitionTimingFunction: "var(--ease-hover)",
      }}
      className={`glass aspect-square w-[5.76rem] sm:w-[6.72rem] lg:w-[7.68rem] ${
        state === "active" ? "glass-active" : ""
      }`}
    >
      <div
        className="pool-tint relative h-full w-full overflow-hidden"
        style={{ borderRadius: MEDIA_RADIUS }}
      >
        {asVideo ? (
          <video
            key={item.mp4}
            autoPlay
            muted
            loop
            playsInline
            poster={item.poster}
            width={item.width}
            height={item.height}
            className="pool-grade h-full w-full object-cover"
          >
            <source src={item.webm} type="video/webm" />
            <source src={item.mp4} type="video/mp4" />
          </video>
        ) : (
          <img
            src={posterSrc}
            width={item.width}
            height={item.height}
            alt=""
            decoding="async"
            loading={eager ? "eager" : "lazy"}
            className="pool-grade h-full w-full object-cover"
          />
        )}

        {item.kind === "video" && !asVideo && (
          <span
            aria-hidden
            className="absolute inset-0 z-10 flex items-center justify-center"
          >
            <span className="glass flex h-8 w-8 items-center justify-center !rounded-full !p-0">
              <Play className="h-3 w-3 translate-x-px text-bone" fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
