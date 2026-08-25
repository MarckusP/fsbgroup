"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import { useIntro } from "./IntroProvider";

const WORD_MS = 700;

/**
 * As palavras que piscam sobre o vídeo (§2) e a assinatura da marca (§28).
 *
 * Tudo é HTML/CSS, nunca gravado dentro do vídeo — é o que permite trocar de idioma
 * sem reeditar o filme.
 */
export function HeroWords({ dict }: { dict: Dictionary }) {
  const { words, signature } = dict.hero;
  const reduceMotion = useReducedMotion();
  const { revealed } = useIntro();
  const [index, setIndex] = useState(0);
  const done = index >= words.length;

  // A sequência só começa quando a abertura devolve a tela: sem isto ela queima
  // inteira por trás da cortina e a pessoa chega no site com o hero já parado.
  useEffect(() => {
    if (reduceMotion || done || !revealed) return;
    const timer = setTimeout(() => setIndex((i) => i + 1), WORD_MS);
    return () => clearTimeout(timer);
  }, [index, done, reduceMotion, revealed]);

  if (reduceMotion) {
    return (
      <div className="space-y-6">
        <p className="type-eyebrow text-electric">{words.join(" · ")}</p>
        <Signature lines={signature} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Altura fixa: a troca de palavras não pode empurrar a assinatura. */}
      <div className="relative h-[1.15em] text-[clamp(2.5rem,9vw,7rem)]">
        {/* Sem `mode="wait"`: a palavra que sai e a que entra se sobrepõem. Com espera,
            entrada + saída consomem quase todo o WORD_MS e a tela fica vazia metade
            do tempo. Sobrepondo, o efeito vira corte rápido — que é o pedido do §2. */}
        <AnimatePresence>
          {!done && (
            <motion.span
              key={words[index]}
              className="type-display absolute inset-0 block text-bone"
              initial={{ opacity: 0, y: "0.18em", filter: "blur(14px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: "-0.14em", filter: "blur(14px)" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {words[index]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Sempre montado, mesmo invisível: o <h1> precisa estar no HTML servido,
          senão o título da página só existe depois de ~3,5 s de animação. */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={done ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <Signature lines={signature} />
      </motion.div>
    </div>
  );
}

function Signature({ lines }: { lines: readonly [string, string] }) {
  return (
    <h1 className="type-display text-[clamp(1.75rem,5.2vw,4rem)] text-bone">
      <span className="block">{lines[0]}</span>
      <span className="block text-electric">{lines[1]}</span>
    </h1>
  );
}
