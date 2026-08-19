"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { pools, type Universe } from "@/content/media-pool";
import type { PathCopy } from "@/content/dictionaries/types";
import { usePointerDeck } from "@/hooks/usePointerDeck";
import { CardLayerStack } from "./CardLayerStack";

export function PathCard({
  universe,
  copy,
  href,
}: {
  universe: Universe;
  copy: PathCopy;
  href: string;
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
      className="group relative isolate flex min-h-[58svh] flex-1 flex-col justify-end overflow-hidden md:min-h-[68svh]"
    >
      <CardLayerStack layers={layers} active={active} />

      {/* Contraste do texto sobre qualquer foto que caia atrás dele. */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-gradient-to-t from-midnight-deep via-midnight-deep/55 to-midnight-deep/15 transition-colors duration-700 group-hover:via-midnight-deep/40 group-hover:to-transparent"
      />

      <div className="relative z-20 flex flex-col gap-5 p-8 md:p-12">
        <h3 className="type-display text-[clamp(2.5rem,6vw,5rem)] text-bone">
          {copy.name}
        </h3>
        <p className="max-w-sm text-balance text-sm leading-relaxed text-bone/70 md:text-base">
          {copy.tagline}
        </p>
        <Link
          href={href}
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-bone transition-colors hover:text-electric"
        >
          {/* Estende o alvo do link a todo o card sem aninhar interativos. */}
          <span className="absolute inset-0 z-30" aria-hidden />
          <span className="relative">{copy.cta}</span>
          <ArrowUpRight
            className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
            strokeWidth={1.5}
          />
        </Link>
      </div>

      {/* Fio de luz que acende na borda interna no hover. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 opacity-0 ring-1 ring-inset ring-electric/40 transition-opacity duration-700 group-hover:opacity-100"
      />
    </article>
  );
}
