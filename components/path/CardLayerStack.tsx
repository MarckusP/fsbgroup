"use client";

import { motion } from "motion/react";
import { LAYER_COUNT } from "@/content/media-pool";
import type { DeckLayer } from "@/hooks/usePointerDeck";

/**
 * A pilha de fotografias atrás do card (§9).
 *
 * Cada camada tem dois níveis: o de fora aplica o parallax lendo as CSS custom
 * properties --pdx/--pdy que o rAF escreve no container (uma escrita por frame, zero
 * render do React); o de dentro anima a entrada com escala, blur e deslocamento na
 * direção do cursor — o "rapid zoom" do briefing.
 */
export function CardLayerStack({
  layers,
  active,
}: {
  layers: readonly DeckLayer[];
  active: boolean;
}) {
  return (
    /* Fundo opaco: sem ele as camadas semitransparentes compõem contra o vídeo do
       hero, que fica atrás de tudo, e as fotos aparecem lavadas. */
    <div
      aria-hidden
      className="pool-tint absolute inset-0 overflow-hidden bg-midnight-deep"
    >
      {layers.map((layer, depth) => {
        // depth 0 é a imagem da frente; as de trás encolhem, apagam e desfocam.
        const back = depth / LAYER_COUNT;
        const parallax = 1 - depth * 0.14;
        const isInitial = layer.id <= LAYER_COUNT;

        return (
          <div
            key={layer.id}
            className="absolute inset-0 will-change-transform"
            style={{
              zIndex: LAYER_COUNT - depth,
              transform:
                "translate3d(calc(var(--pdx, 0px) * var(--d)), calc(var(--pdy, 0px) * var(--d)), 0)",
              ["--d" as string]: parallax.toFixed(3),
            }}
          >
            <motion.div
              className="pool-grade absolute inset-0"
              initial={{
                opacity: 0,
                scale: 1.32,
                filter: "blur(14px)",
                x: layer.dx * -44,
                y: layer.dy * -44,
              }}
              animate={{
                // Em repouso só a imagem da frente aparece, e atenuada; no hover a
                // pilha inteira acende, com as camadas de trás cada vez mais apagadas.
                opacity: active ? 1 - back * 0.9 : depth === 0 ? 0.72 : 0,
                scale: 1 - depth * 0.045,
                filter: `blur(${(depth * 0.7).toFixed(1)}px)`,
                rotate: layer.tilt * depth * 0.9,
                x: layer.dx * depth * 16,
                y: layer.dy * depth * 16,
              }}
              transition={{
                duration: depth === 0 ? 0.62 : 0.8,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <img
                src={layer.image.src}
                width={layer.image.width}
                height={layer.image.height}
                alt=""
                decoding="async"
                loading={isInitial ? "eager" : "lazy"}
                className="h-full w-full object-cover"
              />
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
