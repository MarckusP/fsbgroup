"use client";

import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";

/** Distância acumulada de deltaY, em px, que dispara a troca de seção. */
const WHEEL_THRESHOLD = 40;
/** Tempo mínimo entre duas trocas — sem isso um único gesto de scroll pularia várias seções. */
const COOLDOWN_MS = 380;

/**
 * Rolar o mouse sobre o "stage" troca de seção, como pedido no briefing do usuário.
 *
 * Só intercepta o wheel quando o próprio stage (nav + texto + grade da seção ativa)
 * já está inteiro dentro da tela — enquanto sobrar conteúdo dele pra cima ou pra baixo
 * do viewport (uma grade de 12 vagas pode passar da altura da tela), o scroll normal
 * do navegador acontece primeiro. Sem isso, uma seção com grade alta ficaria com as
 * últimas vagas inalcançáveis: todo wheel sobre o stage trocaria de seção antes de
 * rolar até lá. Usa o retângulo do próprio `containerRef` (não `document.scrollHeight`)
 * de propósito — a página também tem o formulário de contato e o rodapé depois do
 * stage, e esses não deviam contar nessa conta.
 *
 * Nas bordas (primeira seção subindo, última descendo) o listener também devolve o
 * evento pro navegador — a página nunca fica presa dentro do stage.
 *
 * O clique na `UniverseSectionNav` é o caminho de navegação acessível por padrão; isto
 * aqui é só um reforço para quem já está com o mouse sobre a área de conteúdo.
 *
 * `WHEEL_THRESHOLD`/`COOLDOWN_MS` ficaram baixos de propósito — pedido explícito pra
 * deixar a troca mais sensível (um scroll leve já basta), em vez de exigir um gesto
 * de scroll mais longo.
 */
export function useSectionWheelNav({
  containerRef,
  index,
  count,
  onChange,
  enabled,
}: {
  containerRef: RefObject<HTMLElement | null>;
  index: number;
  count: number;
  onChange: (next: number) => void;
  enabled: boolean;
}) {
  const accumulated = useRef(0);
  const cooling = useRef(false);
  const indexRef = useRef(index);
  useLayoutEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !enabled) return;

    const onWheel = (event: WheelEvent) => {
      const goingDown = event.deltaY > 0;
      const atStart = indexRef.current === 0 && !goingDown;
      const atEnd = indexRef.current === count - 1 && goingDown;
      if (atStart || atEnd) {
        accumulated.current = 0;
        return;
      }

      // Ainda sobra conteúdo do próprio stage fora da tela na direção do gesto —
      // deixa o scroll normal acontecer em vez de trocar de seção.
      const rect = node.getBoundingClientRect();
      const moreBelow = rect.bottom > window.innerHeight + 1;
      const moreAbove = rect.top < -1;
      if ((goingDown && moreBelow) || (!goingDown && moreAbove)) {
        accumulated.current = 0;
        return;
      }

      event.preventDefault();
      if (cooling.current) return;

      accumulated.current += event.deltaY;
      if (Math.abs(accumulated.current) < WHEEL_THRESHOLD) return;

      accumulated.current = 0;
      cooling.current = true;
      onChange(Math.min(count - 1, Math.max(0, indexRef.current + (goingDown ? 1 : -1))));
      setTimeout(() => {
        cooling.current = false;
      }, COOLDOWN_MS);
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [containerRef, count, enabled, onChange]);
}
