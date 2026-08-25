"use client";

import type { Dictionary } from "@/lib/dictionaries";
import { useIntro } from "./IntroProvider";

/**
 * O que fica por cima durante a abertura: nada além de uma saída e um sinal de vida.
 *
 * Ninguém deve ser obrigado a assistir 10 s de vídeo para chegar ao site — o botão de
 * pular é a promessa disso, e `Escape` faz o mesmo (ver IntroProvider).
 */
export function IntroCurtain({ dict }: { dict: Dictionary }) {
  const { phase, revealed, finish } = useIntro();
  if (phase === "done") return null;

  return (
    <div
      data-intro-curtain=""
      className={`pointer-events-none fixed inset-0 z-50 transition-opacity duration-700 ${
        revealed ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Sinal de que algo está vindo, enquanto o vídeo ainda não pode tocar. */}
      {phase === "loading" && (
        <p className="type-eyebrow absolute bottom-8 left-[var(--shell-x)] flex items-center gap-3 text-bone/40 md:bottom-10">
          {dict.hero.intro.loading}
          <span
            aria-hidden
            className="relative block h-px w-14 overflow-hidden bg-bone/20"
          >
            <span className="absolute inset-y-0 left-0 w-1/3 bg-electric motion-safe:animate-[hint_2.4s_var(--ease-cinema)_infinite]" />
          </span>
        </p>
      )}

      {phase === "playing" && (
        <button
          type="button"
          onClick={finish}
          className="type-eyebrow hairline pointer-events-auto absolute bottom-6 left-[var(--shell-x)] rounded-full border bg-midnight-deep/50 px-5 py-2.5 text-bone/60 backdrop-blur-md transition hover:border-electric hover:text-bone focus-visible:text-bone md:bottom-8"
        >
          {dict.hero.intro.skip}
        </button>
      )}
    </div>
  );
}
