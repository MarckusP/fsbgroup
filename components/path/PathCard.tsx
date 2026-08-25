"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { pools, type Universe } from "@/content/media-pool";
import type { PathCopy } from "@/content/dictionaries/types";
import { usePointerDeck } from "@/hooks/usePointerDeck";
import { CardLayerStack } from "./CardLayerStack";

/**
 * Um dos dois universos (§8), como objeto solto acima da página.
 *
 * Três invólucros, cada um com uma só função, porque `transform` é uma propriedade só e
 * os três efeitos disputariam entre si: o <article> leviga, o `lift` sobe no hover e o
 * `tilt` inclina seguindo o cursor. Nenhum deles clipa — quem clipa é cada camada da
 * pilha, senão o leque do hover seria cortado bem na borda onde deveria espiar.
 */
export function PathCard({
  universe,
  copy,
  href,
  floatDelay = "0s",
}: {
  universe: Universe;
  copy: PathCopy;
  href: string;
  /** Defasa a levitação entre os dois cards — em fase, parecem um bloco só. */
  floatDelay?: string;
}) {
  const reduceMotion = useReducedMotion();
  const pool = pools[universe];
  const { containerRef, layers, active, handlers } = usePointerDeck({
    pool,
    enabled: !reduceMotion,
  });

  return (
    <article
      ref={containerRef}
      {...handlers}
      style={{ animationDelay: floatDelay }}
      className="group relative min-h-[58svh] [perspective:1400px] motion-safe:animate-[float_7s_ease-in-out_infinite] md:min-h-[66svh]"
    >
      <div className="h-full transition-transform duration-500 ease-[var(--ease-cinema)] group-hover:-translate-y-2.5 group-focus-within:-translate-y-2.5">
        <div
          className="relative h-full transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform:
              "rotateX(calc(var(--pny, 0) * -7deg)) rotateY(calc(var(--pnx, 0) * 9deg))",
          }}
        >
          <CardLayerStack
            layers={layers}
            active={active}
            reduceMotion={Boolean(reduceMotion)}
          />

          {/* A moldura. Transparente de propósito: quem pinta é a pilha atrás — daqui
              saem só o canto arredondado, o fio de borda e a sombra que descola o card
              do vídeo. O `ring` do Tailwind é box-shadow, então `transition-shadow`
              cobre a sombra E o acender do fio azul. */}
          <div className="relative z-10 h-full overflow-hidden rounded-[28px] shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)] ring-1 ring-bone/10 transition-shadow duration-700 group-hover:shadow-[0_60px_140px_-40px_rgb(23_67_244/0.32),0_40px_100px_-50px_rgb(0_0_0/0.95)] group-hover:ring-electric/40">
            {/* O card inteiro é UM link: nada de sobreposição invisível por cima do
                conteúdo, e o foco por teclado cai no card todo. */}
            <Link
              href={href}
              aria-label={copy.cta}
              className="flex h-full flex-col justify-end"
            >
              {/* Contraste do texto sobre qualquer foto que caia atrás dele. */}
              <div
                aria-hidden
                className="absolute inset-0 z-10 bg-gradient-to-t from-midnight-deep via-midnight-deep/55 to-midnight-deep/15 transition-colors duration-700 group-hover:via-midnight-deep/40 group-hover:to-transparent"
              />

              <div className="relative z-20 flex flex-col items-start gap-5 p-8 md:p-10">
                <h3 className="type-display text-[clamp(2.25rem,5vw,4.25rem)] text-bone">
                  {copy.name}
                </h3>
                <p className="max-w-sm text-balance text-sm leading-relaxed text-bone/70 md:text-base">
                  {copy.tagline}
                </p>
                {/* Pílula, não link de texto: o card é clicável e precisa parecer. */}
                <span className="hairline inline-flex items-center gap-2 rounded-full border bg-midnight-deep/40 px-5 py-2.5 text-sm font-medium text-bone backdrop-blur-md transition duration-500 group-hover:border-electric group-hover:bg-electric/15">
                  {copy.cta}
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                    strokeWidth={1.5}
                  />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
