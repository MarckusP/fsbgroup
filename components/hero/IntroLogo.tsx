"use client";

import { animate } from "motion/react";
import { useEffect, useRef } from "react";
import { logos } from "@/content/site";
import { markIntroDone, useIntroDone } from "@/lib/intro";

/** Duração total da abertura, em segundos — teto de 2 s pedido pro teste. */
const APPEAR_S = 0.7;
const TRAVEL_S = 1.2;

/**
 * Abertura da home: a logo surge grande no centro, por cima de tudo e ainda translúcida,
 * e desliza até o lugar dela no cabeçalho (`[data-intro-target]`). Quando pousa, o sinal
 * de `lib/intro` libera o vídeo e as palavras do hero.
 *
 * O véu é renderizado já no HTML do servidor — se só aparecesse depois da hidratação, a
 * página piscaria inteira antes da abertura. Enquanto ele existe, o CSS esconde a logo
 * do cabeçalho (`body:has(.intro-overlay)` em globals.css), pra não haver duas logos.
 * Sem JS ou com movimento reduzido, o CSS some com o véu e o efeito pula a animação.
 */
export function IntroLogo({ alt }: { alt: string }) {
  const introDone = useIntroDone();
  const veilRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (introDone) return;
    const veil = veilRef.current;
    const logo = logoRef.current;
    const target = document.querySelector<HTMLElement>("[data-intro-target]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!veil || !logo || !target || reduce) {
      markIntroDone();
      return;
    }

    const size = Math.min(window.innerWidth, window.innerHeight) * 0.55;
    const start = {
      left: (window.innerWidth - size) / 2,
      top: (window.innerHeight - size) / 2,
      width: size,
      height: size,
    };
    // Daqui em diante a posição é em px absolutos — o centramento por `translate` do
    // HTML inicial sairia somado a ela.
    Object.assign(logo.style, {
      translate: "none",
      left: `${start.left}px`,
      top: `${start.top}px`,
      width: `${start.width}px`,
      height: `${start.height}px`,
    });

    let cancelled = false;
    const run = async () => {
      await animate(logo, { opacity: [0, 0.6], scale: [0.88, 1] }, { duration: APPEAR_S, ease: "easeOut" });
      if (cancelled) return;
      // Mede o destino só agora: fontes e layout do cabeçalho já assentaram.
      const end = target.getBoundingClientRect();
      await Promise.all([
        animate(
          logo,
          { left: end.left, top: end.top, width: end.width, height: end.height, opacity: 1 },
          { duration: TRAVEL_S, ease: [0.65, 0, 0.35, 1] },
        ),
        animate(veil, { opacity: 0 }, { duration: TRAVEL_S, ease: "easeInOut" }),
      ]);
      if (!cancelled) markIntroDone();
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [introDone]);

  if (introDone) return null;

  return (
    <>
    {/* Sem JS a animação nunca rodaria e o véu ficaria pra sempre por cima da página. */}
    <noscript>
      <style>{".intro-overlay{display:none}[data-intro-target]{opacity:1!important}"}</style>
    </noscript>
    <div className="intro-overlay pointer-events-none fixed inset-0 z-[60]" aria-hidden>
      <div ref={veilRef} className="absolute inset-0 bg-midnight-deep/85 backdrop-blur-sm" />
      {/* eslint-disable-next-line @next/next/no-img-element -- mídia já otimizada, ver eslint.config */}
      <img
        ref={logoRef}
        src={logos.lightRetina}
        alt={alt}
        width={256}
        height={256}
        className="absolute left-1/2 top-1/2 h-[55vmin] w-[55vmin] -translate-x-1/2 -translate-y-1/2 opacity-0"
      />
    </div>
    </>
  );
}
