"use client";

import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef } from "react";

/** Pixels de scroll que equivalem a andar um quadro inteiro. */
const WHEEL_PER_SLOT = 170;
/** O mesmo, para o dedo. Menor que o do wheel: um arrasto é um movimento direto, e exigir
 *  os 170px do mouse faria a fita parecer pesada na mão. */
const TOUCH_PER_SLOT = 115;
/** Movimento acumulado, em px, antes de decidir se o arrasto é vertical ou horizontal. */
const AXIS_LOCK = 8;
/** Fração da distância restante percorrida a cada frame — o "arrasto" do movimento. */
const LERP = 0.18;
/** Silêncio, em ms, depois do qual o arco encaixa no quadro mais próximo. */
const SNAP_DELAY_MS = 130;
/** Abaixo disso o movimento é considerado terminado e o rAF para. */
const EPSILON = 0.0004;

/**
 * Navegação do arco com posição CONTÍNUA — o scroll não dispara uma transição pronta,
 * ele move a fita.
 *
 * A fita é UMA SÓ, do primeiro quadro da primeira seção ao último da última: as seções são
 * faixas dentro dela, não listas separadas. Por isso este hook não conhece seções — ele só
 * anda num índice global, e quem traduz "quadro em destaque" para "seção ativa" é o
 * `UniverseStage`. Foi o que eliminou a antiga acumulação de "pressão" na ponta de cada
 * seção: não existe mais ponta pra insistir, as imagens da seção seguinte já estão na fila.
 *
 * A posição é um número real (2.37 é "entre o terceiro e o quarto quadro"): cada evento de
 * wheel soma `deltaY / WHEEL_PER_SLOT` ao alvo, e um laço de `requestAnimationFrame`
 * persegue esse alvo. É isso que faz a mão de quem rola conduzir o movimento, em vez de
 * apenas acioná-lo — com uma transição CSS de duração fixa, o gesto e a animação são
 * coisas separadas, e é daí que vinha a sensação de troca abrupta.
 *
 * Quando o scroll para, o alvo encaixa no inteiro mais próximo (`SNAP_DELAY_MS`), então a
 * fita sempre descansa com um quadro centralizado.
 *
 * O laço NÃO re-renderiza o React: ele chama `onFrame` com a posição e quem desenha escreve
 * direto no DOM — mesmo padrão já usado em `usePointerDeck`. O React só é avisado
 * (`onNavigate`) quando o quadro em destaque muda de fato, porque disso dependem coisas
 * discretas: qual vídeo toca, o link do site, o `aria-current` e qual seção está ativa.
 *
 * A posição tem UM DONO SÓ: o ref daqui. O estado do React é saída, nunca entrada — quem
 * quer mover a fita chama `goTo`, e não escreve num prop que este hook leria de volta. Foi
 * o que consertou o glide se atropelando: com a posição espelhada num prop, cada aviso
 * intermediário do laço voltava como se fosse um salto novo (o efeito que a lia rodava com
 * um render já vencido) e reescrevia o alvo no meio do caminho — um salto de nove quadros
 * dava dois passos e voltava.
 *
 * Duas guardas herdadas, ambas deliberadas:
 *
 * 1. Só intercepta o wheel quando o stage já está inteiro dentro da tela — enquanto sobrar
 *    conteúdo dele fora do viewport, o scroll normal do navegador acontece primeiro. Usa o
 *    retângulo do próprio `containerRef` (não `document.scrollHeight`): a página tem o
 *    formulário de contato e o rodapé depois do stage, e eles não contam.
 * 2. Nas duas pontas da fita (primeiro quadro subindo, último descendo) o evento volta pro
 *    navegador — a página nunca fica presa no stage.
 *
 * No TOUCH o gesto é outro, e por isso tem um caminho próprio (`dragRef`, o quadro do arco):
 * `wheel` não existe ali, e a régua da guarda 1 — "só pega o scroll quando o stage inteiro
 * couber na tela" — nunca fecharia num celular, onde o stage é mais alto que a tela. Então
 * o arco é tratado como o que ele é: um objeto que se arrasta. O dedo sobre ele conduz a
 * fita (pra cima ou pra esquerda avança), e o resto da página rola normalmente. Chegando a
 * uma ponta da fita, o mesmo dedo passa a levar a PÁGINA, sem soltar o gesto e sem prender
 * ninguém no carrossel.
 */
export function useArcScrub({
  containerRef,
  dragRef,
  frameCount,
  onNavigate,
  onFrame,
  enabled,
}: {
  containerRef: RefObject<HTMLElement | null>;
  /** O quadro do arco — onde o arrasto de touch conduz a fita. Precisa de
   *  `touch-action: none` no CSS, senão o navegador começa a rolar antes do primeiro
   *  `touchmove` e o gesto nunca chega aqui. */
  dragRef: RefObject<HTMLElement | null>;
  /** Quantos quadros a fita inteira tem, somando todas as seções. */
  frameCount: number;
  onNavigate: (index: number) => void;
  /** Chamado a cada frame com a posição contínua. Escreve no DOM, não no estado. */
  onFrame: (position: number) => void;
  enabled: boolean;
}): { goTo: (index: number) => void } {
  const position = useRef(0);
  const target = useRef(0);
  const frame = useRef<number | null>(null);
  const snapTimer = useRef<number | null>(null);
  /** O laço vive no efeito principal; isto o expõe para `goTo`. Manter uma segunda cópia
   *  do tick aqui deixaria dois laços concorrendo pelo mesmo `frame`, cada um agendando o
   *  próximo quadro por cima do outro. */
  const run = useRef<() => void>(() => {});
  /** Último índice avisado ao React — só pra não avisar duas vezes o mesmo. */
  const reported = useRef(0);

  // Espelhado em ref para o listener e o laço não precisarem ser reatados a cada frame.
  const live = useRef({ frameCount, onNavigate, onFrame, enabled });
  useLayoutEffect(() => {
    live.current = { frameCount, onNavigate, onFrame, enabled };
  });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    /** Avisa o React quando o quadro em destaque muda — só então, não a cada frame. */
    const reportIndex = () => {
      const next = Math.round(position.current);
      if (next === reported.current) return;
      reported.current = next;
      live.current.onNavigate(next);
    };

    const tick = () => {
      const next = position.current + (target.current - position.current) * LERP;
      const settled = Math.abs(target.current - next) < EPSILON;
      position.current = settled ? target.current : next;
      live.current.onFrame(position.current);
      reportIndex();
      frame.current = settled ? null : requestAnimationFrame(tick);
    };

    const loop = () => {
      // Sem animação: salta direto pro alvo (o CSS global já zera as transições em
      // `prefers-reduced-motion`, e um laço de rAF aqui contrariaria isso).
      if (!live.current.enabled) {
        position.current = target.current;
        live.current.onFrame(position.current);
        reportIndex();
        return;
      }
      if (frame.current == null) frame.current = requestAnimationFrame(tick);
    };
    run.current = loop;

    const scheduleSnap = () => {
      if (snapTimer.current != null) clearTimeout(snapTimer.current);
      snapTimer.current = window.setTimeout(() => {
        target.current = Math.round(target.current);
        loop();
      }, SNAP_DELAY_MS);
    };

    const onWheel = (event: WheelEvent) => {
      if (!live.current.enabled || event.deltaY === 0) return;
      const goingDown = event.deltaY > 0;
      const last = Math.max(0, live.current.frameCount - 1);

      // Pontas da fita: devolve o gesto pro navegador.
      const atFirst = !goingDown && target.current <= 0.001;
      const atLast = goingDown && target.current >= last - 0.001;
      if (atFirst || atLast) return;

      // Ainda sobra stage fora da tela na direção do gesto: scroll normal primeiro.
      const rect = node.getBoundingClientRect();
      if (
        (goingDown && rect.bottom > window.innerHeight + 1) ||
        (!goingDown && rect.top < -1)
      ) {
        return;
      }

      event.preventDefault();

      const raw = target.current + event.deltaY / WHEEL_PER_SLOT;
      target.current = Math.min(last, Math.max(0, raw));

      scheduleSnap();
      loop();
    };

    /* --- arrasto (touch) ---------------------------------------------------------- */

    let lastX = 0;
    let lastY = 0;
    let travelX = 0;
    let travelY = 0;
    let axis: "x" | "y" | null = null;

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      lastX = touch.clientX;
      lastY = touch.clientY;
      travelX = 0;
      travelY = 0;
      axis = null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!live.current.enabled) return;
      const touch = event.touches[0];
      if (!touch) return;

      // Positivo = avança na fita: arrastar pra CIMA (como rolar a página pra baixo) ou
      // pra ESQUERDA (como empurrar o carrossel).
      const stepX = lastX - touch.clientX;
      const stepY = lastY - touch.clientY;
      lastX = touch.clientX;
      lastY = touch.clientY;
      travelX += Math.abs(stepX);
      travelY += Math.abs(stepY);

      // Trava de eixo: sem ela, um arrasto vertical com qualquer tremor lateral ficaria
      // alternando de eixo no meio do gesto.
      if (axis === null) {
        if (travelX + travelY < AXIS_LOCK) return;
        axis = travelX > travelY ? "x" : "y";
      }

      const step = axis === "x" ? stepX : stepY;
      const last = Math.max(0, live.current.frameCount - 1);
      const raw = target.current + step / TOUCH_PER_SLOT;

      if (raw < 0 || raw > last) {
        // Ponta da fita: o dedo passa a levar a página. É o que evita o carrossel virar
        // uma armadilha num celular, onde ele ocupa boa parte da tela.
        target.current = Math.min(last, Math.max(0, raw));
        if (axis === "y") window.scrollBy(0, stepY);
      } else {
        target.current = raw;
        if (event.cancelable) event.preventDefault();
      }

      scheduleSnap();
      loop();
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    const drag = dragRef.current;
    drag?.addEventListener("touchstart", onTouchStart, { passive: true });
    drag?.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      node.removeEventListener("wheel", onWheel);
      drag?.removeEventListener("touchstart", onTouchStart);
      drag?.removeEventListener("touchmove", onTouchMove);
      if (frame.current != null) cancelAnimationFrame(frame.current);
      if (snapTimer.current != null) clearTimeout(snapTimer.current);
      frame.current = null;
      snapTimer.current = null;
    };
  }, [containerRef, dragRef]);

  // Saltos vindos de fora do scroll: clique na barra de seções, nos botões de seção ou
  // num quadro lateral do arco. Todos são o MESMO movimento que o scroll faz — a fita
  // desliza até o quadro pedido pelo mesmo laço. Pular de seção é só um alvo mais distante:
  // o laço é exponencial, então uma seção adiante chega em ~0,3 s e a ponta oposta da fita
  // em ~0,9 s, sem precisar de um caminho separado (nem de um corte) para saltos longos.
  const goTo = useCallback((index: number) => {
    const last = Math.max(0, live.current.frameCount - 1);
    target.current = Math.min(last, Math.max(0, index));
    if (!live.current.enabled) {
      position.current = target.current;
      live.current.onFrame(position.current);
      const rounded = Math.round(position.current);
      if (rounded !== reported.current) {
        reported.current = rounded;
        live.current.onNavigate(rounded);
      }
      return;
    }
    run.current();
  }, []);

  return { goTo };
}
