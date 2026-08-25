"use client";

import { motion } from "motion/react";
import { LAYER_COUNT, type PoolItem } from "@/content/media-pool";
import type { DeckLayer } from "@/hooks/usePointerDeck";

/** Raio dos cantos, igual ao do card — as camadas precisam casar com a moldura. */
const RADIUS = 28;
/**
 * Deslocamento do leque, por camada de profundidade.
 *
 * O quanto de fato ESPIA é o deslocamento menos o encolhimento da própria camada — por
 * isso a escala quase não cai (uma camada a 0,96 encolhe ~17 px de cada lado num card
 * de 850 px e engole o leque inteiro). Com estes números a camada mais funda sobra
 * ~42 px, que é o gap entre os dois cards: o baralho aparece sem invadir o vizinho.
 */
const FAN_X = 14;
const FAN_Y = 10;
const FAN_SCALE = 0.008;

/**
 * A pilha de fotografias e clipes do card (§9).
 *
 * Em repouso só a camada da frente aparece e o card lê como um objeto único. No hover a
 * pilha se abre em leque: as camadas de trás escapam pelas bordas, cada uma com o mesmo
 * canto arredondado, e é isso que mostra que existe um baralho de trabalhos ali.
 *
 * Dois níveis por camada. O de fora aplica o parallax lendo as CSS custom properties
 * --pdx/--pdy que o rAF escreve no container (uma escrita por frame, zero render do
 * React). O de dentro é quem se move no leque e quem CLIPA — o clip precisa estar aqui,
 * e não no card, senão as camadas de trás são cortadas justamente onde deveriam espiar.
 *
 * Só a camada da FRENTE (depth 0) pode virar `<video>` — "isso é um produto vivo" (§9)
 * sem multiplicar decodificadores escondidos: o leque atrás é pequeno, girado e
 * parcialmente coberto, ninguém percebe se tem movimento ali, e reproduzir até 4 vídeos
 * simultâneos só para isso seria desperdício. Toda camada de trás usa o poster do
 * próprio clipe — é por isso que o pipeline sempre gera um ao lado do webm/mp4.
 */
export function CardLayerStack({
  layers,
  active,
  reduceMotion,
}: {
  layers: readonly DeckLayer[];
  active: boolean;
  reduceMotion: boolean;
}) {
  return (
    <div aria-hidden className="absolute inset-0 z-0">
      {layers.map((layer, depth) => {
        // depth 0 é a camada da frente; as de trás encolhem, apagam e desfocam.
        const parallax = 1 - depth * 0.08;
        const isInitial = layer.id <= LAYER_COUNT;
        const front = depth === 0;

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
              className={`pool-tint absolute inset-0 overflow-hidden bg-midnight-deep ${
                front ? "" : "ring-1 ring-bone/10"
              }`}
              style={{ borderRadius: RADIUS }}
              initial={{
                opacity: 0,
                scale: 1.32,
                filter: "blur(14px)",
                x: layer.dx * -44,
                y: layer.dy * -44,
              }}
              animate={
                front
                  ? { opacity: 1, scale: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px)" }
                  : active
                    ? {
                        // O leque: cada camada mais funda sai mais para fora, gira um
                        // pouco mais e apaga um pouco mais.
                        opacity: 0.88 - depth * 0.15,
                        scale: 1 - depth * FAN_SCALE,
                        x: depth * FAN_X + layer.dx * 6,
                        y: depth * -FAN_Y + layer.dy * 6,
                        rotate: layer.tilt * depth * 1.2,
                        filter: `blur(${(depth * 0.5).toFixed(1)}px)`,
                      }
                    : {
                        opacity: 0,
                        scale: 0.96,
                        x: 0,
                        y: 0,
                        rotate: 0,
                        filter: "blur(0px)",
                      }
              }
              transition={{ duration: front ? 0.62 : 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <PoolMedia
                item={layer.media}
                eager={isInitial}
                asVideo={front && !reduceMotion}
              />
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * `pool-grade` vive na mídia em si, não no wrapper: o motion escreve `filter` inline
 * para o blur do leque, e um `filter` inline sobrescreve o da classe — a grade cromática
 * comum a todo o pool sumiria sem que ninguém notasse.
 */
function PoolMedia({
  item,
  eager,
  asVideo,
}: {
  item: PoolItem;
  eager: boolean;
  /** Só true na camada da frente, e só quando o item é um clipe. */
  asVideo: boolean;
}) {
  if (item.kind === "video" && asVideo) {
    return (
      <video
        // A key força remontagem quando o MESMO elemento de vídeo troca de clipe (o
        // baralho reaproveita a posição depth 0) — sem isso o navegador manteria o
        // buffer do clipe anterior até o `src` da <source> ser trocado por baixo.
        key={item.mp4}
        autoPlay
        muted
        loop
        playsInline
        preload={eager ? "auto" : "metadata"}
        poster={item.poster}
        width={item.width}
        height={item.height}
        className="pool-grade h-full w-full object-cover"
      >
        <source src={item.webm} type="video/webm" />
        <source src={item.mp4} type="video/mp4" />
      </video>
    );
  }

  const src = item.kind === "video" ? item.poster : item.src;
  return (
    <img
      src={src}
      width={item.width}
      height={item.height}
      alt=""
      decoding="async"
      loading={eager ? "eager" : "lazy"}
      className="pool-grade h-full w-full object-cover"
    />
  );
}
