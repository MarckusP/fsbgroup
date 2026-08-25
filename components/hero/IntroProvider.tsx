"use client";

import { useReducedMotion } from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * A abertura em tela cheia (§3).
 *
 * O vídeo do hero é um *visual identity trailer*: ele toca sozinho, ocupando tudo, e só
 * quando termina é que o header, os títulos e os cards entram. Este contexto é o único
 * dono desse tempo — `CinemaBackdrop` reporta o vídeo, `Curtain` revela o conteúdo.
 *
 * Regra que atravessa o arquivo inteiro: NADA aqui pode deixar a pessoa presa atrás da
 * cortina. Vídeo que não carrega, autoplay bloqueado, aba em segundo plano — todos os
 * caminhos terminam em `finish()`.
 */

/** Sem `canplay` até aqui, a abertura é dispensada e a página monta sobre o poster. */
const LOAD_CAP_MS = 2500;
/**
 * Teto absoluto de cada fase. Reiniciado quando o vídeo começa a tocar, senão um clipe
 * que só engata perto do LOAD_CAP teria o final cortado pelo próprio teto.
 */
const HARD_CAP_MS = 13000;
/** Duração do escalonamento de entrada, depois do qual a cortina some de vez. */
const REVEAL_MS = 900;

type Phase = "loading" | "playing" | "revealing" | "done";

type IntroValue = {
  readonly phase: Phase;
  /** O conteúdo da página já pode aparecer. */
  readonly revealed: boolean;
  readonly notePlayable: () => void;
  readonly finish: () => void;
};

const IntroContext = createContext<IntroValue | null>(null);

export function useIntro() {
  const value = useContext(IntroContext);
  if (!value) throw new Error("useIntro precisa de <IntroProvider> acima.");
  return value;
}

export function IntroProvider({ children }: { children: React.ReactNode }) {
  // "loading" no servidor E no cliente: o HTML servido já sai com a página em opacity-0,
  // então a hidratação não pisca o conteúdo antes de escondê-lo.
  const [phase, setPhase] = useState<Phase>("loading");
  const reduceMotion = useReducedMotion();
  // Movimento reduzido não vê abertura nenhuma: a página já nasce montada. Derivado,
  // não sincronizado por efeito — `useReducedMotion` já é a assinatura do media query.
  const phaseNow: Phase = reduceMotion ? "done" : phase;
  const revealed = phaseNow === "revealing" || phaseNow === "done";

  const finish = useCallback(() => {
    setPhase((current) =>
      current === "revealing" || current === "done" ? current : "revealing",
    );
  }, []);

  const notePlayable = useCallback(() => {
    setPhase((current) => (current === "loading" ? "playing" : current));
  }, []);

  // Enquanto a cortina está fechada não há para onde rolar. Voltar ao topo importa
  // porque o navegador restaura a posição de scroll ao recarregar.
  useEffect(() => {
    if (revealed) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = previous;
    };
  }, [revealed]);

  // Vídeo que não fica pronto a tempo não segura a página — ela monta sobre o poster.
  useEffect(() => {
    if (phaseNow !== "loading") return;
    const timer = setTimeout(finish, LOAD_CAP_MS);
    return () => clearTimeout(timer);
  }, [phaseNow, finish]);

  // Rede lenta, aba em segundo plano, `onEnded` que nunca chega: o teto cobre tudo.
  useEffect(() => {
    if (revealed) return;
    const timer = setTimeout(finish, HARD_CAP_MS);
    return () => clearTimeout(timer);
  }, [revealed, phaseNow, finish]);

  useEffect(() => {
    if (phaseNow !== "revealing") return;
    const timer = setTimeout(() => setPhase("done"), REVEAL_MS);
    return () => clearTimeout(timer);
  }, [phaseNow]);

  useEffect(() => {
    if (revealed) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, finish]);

  const value = useMemo<IntroValue>(
    () => ({ phase: phaseNow, revealed, notePlayable, finish }),
    [phaseNow, revealed, notePlayable, finish],
  );

  return <IntroContext value={value}>{children}</IntroContext>;
}
