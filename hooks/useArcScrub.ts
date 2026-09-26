"use client";

import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef } from "react";

/** Pixels de scroll que equivalem a andar um quadro inteiro. */
const WHEEL_PER_SLOT = 170;
/** O mesmo, para o arrasto direto (dedo ou mouse). Menor que o do wheel: um arrasto é um
 *  movimento direto, e exigir os 170px faria a fita parecer pesada na mão. */
const DRAG_PER_SLOT = 115;
/** Movimento acumulado, em px, antes de decidir se o arrasto é vertical ou horizontal. */
const AXIS_LOCK = 8;
/** Fração da distância restante percorrida a cada frame — o "arrasto" do movimento. */
const LERP = 0.18;
/** Silêncio, em ms, depois do qual o arco encaixa no quadro mais próximo. */
const SNAP_DELAY_MS = 130;
/** Abaixo disso o movimento é considerado terminado e o rAF para. */
const EPSILON = 0.0004;
/** Autoplay: silêncio antes de a fita começar a andar sozinha, e o intervalo entre quadros
 *  daí em diante. Qualquer interação (scroll, arrasto, clique) zera a contagem. */
const AUTOPLAY_MS = 3000;
/** Duração do encaixe da página no stage, em ms — o wheel fica engolido durante ele. */
const ALIGN_MS = 550;

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
 * 1. Trava: quando o stage entra na tela na direção do gesto, a página encaixa nele
 *    (centralizado abaixo do cabeçalho fixo) e o wheel passa a andar só a fita. Usa o
 *    retângulo do próprio `containerRef` (não `document.scrollHeight`): a página tem o
 *    formulário de contato e o rodapé depois do stage, e eles não contam.
 * 2. Nas duas pontas da fita (primeiro quadro subindo, último descendo) o evento volta pro
 *    navegador — a página nunca fica presa no stage.
 *
 * No ARRASTO DIRETO (dedo no touch, botão do mouse no desktop) o gesto é outro, e por isso
 * tem um caminho próprio (`dragRef`, o quadro do arco): `wheel` não existe no touch, e a
 * régua da guarda 1 — "só pega o scroll quando o stage inteiro couber na tela" — nunca
 * fecharia num celular, onde o stage é mais alto que a tela. Então o arco é tratado como o
 * que ele é: um objeto que se arrasta. O ponteiro sobre ele conduz a fita (pra cima ou pra
 * esquerda avança), e o resto da página rola normalmente. Chegando a uma ponta da fita, o
 * mesmo gesto passa a levar a PÁGINA, sem soltar o gesto e sem prender ninguém no
 * carrossel. Pointer Events (não touch/mouse separados) é o que unifica dedo, mouse e
 * caneta no mesmo caminho, com `setPointerCapture` garantindo que soltar fora do quadro
 * ainda encerre o gesto.
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
  /** Reinicia a contagem do autoplay — exposto pelo efeito principal para `goTo`. */
  const restartIdle = useRef<() => void>(() => {});

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

    /* --- autoplay ----------------------------------------------------------------- */

    // Sem interação por AUTOPLAY_MS, a fita avança um quadro a cada AUTOPLAY_MS e, no
    // último, volta ao primeiro. Não anda com a galeria fora da tela nem com a aba em
    // segundo plano (o quadro só adiantaria sem ninguém ver), e nunca com movimento
    // reduzido — conteúdo que se move sozinho é justamente o que essa preferência evita.
    let visible = false;
    let idleTimer: number | null = null;
    /** Página deslizando pra encaixar no stage (ver a trava em `onWheel`). */
    let aligning = false;

    const autoplayTick = () => {
      idleTimer = window.setTimeout(autoplayTick, AUTOPLAY_MS);
      if (!live.current.enabled || !visible || document.hidden) return;
      const last = Math.max(0, live.current.frameCount - 1);
      const next = Math.round(target.current) + 1;
      target.current = next > last ? 0 : next;
      loop();
    };

    const restart = () => {
      if (idleTimer != null) clearTimeout(idleTimer);
      idleTimer = window.setTimeout(autoplayTick, AUTOPLAY_MS);
    };
    restartIdle.current = restart;
    restart();

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = visible;
        visible = entry.isIntersecting;
        // Ao entrar na tela, conta os 3 s a partir dali — não herda um timer já vencido.
        if (visible && !wasVisible) restart();
      },
      { threshold: 0.2 },
    );
    observer.observe(node);

    // Rolar a página conta como interação — no touch não existe `wheel`, e é assim que o
    // gesto do dedo chega aqui. O autoplay nunca rola a página, então não se auto-reinicia.
    window.addEventListener("scroll", restart, { passive: true });

    const onWheel = (event: WheelEvent) => {
      if (!live.current.enabled) return;
      // Rolar em qualquer ponto da página conta como interação.
      restart();

      // Swipe horizontal do trackpad (Mac) sobre o arco: conduz a fita, como o arrasto.
      // Sem isto o gesto sobra pro navegador, que o lê como "voltar" e sai da página.
      // Fica restrito ao quadro do arco — no resto da página não há o que rolar de lado.
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        const drag = dragRef.current;
        if (!drag || !(event.target instanceof Node) || !drag.contains(event.target)) return;
        event.preventDefault();
        const last = Math.max(0, live.current.frameCount - 1);
        const raw = target.current + event.deltaX / WHEEL_PER_SLOT;
        target.current = Math.min(last, Math.max(0, raw));
        scheduleSnap();
        loop();
        return;
      }

      if (event.deltaY === 0) return;
      const goingDown = event.deltaY > 0;
      const last = Math.max(0, live.current.frameCount - 1);

      // Pontas da fita: devolve o gesto pro navegador.
      const atFirst = !goingDown && target.current <= 0.001;
      const atLast = goingDown && target.current >= last - 0.001;
      if (atFirst || atLast) return;

      // Trava: com o stage entrando na tela na direção do gesto, a página ENCAIXA nele
      // (centralizado no espaço abaixo do cabeçalho fixo) e fica parada; daí a rolagem só
      // anda a fita, do primeiro ao último quadro, como uma peça única. As pontas acima
      // devolvem o gesto — é assim que a página segue depois da última imagem.
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight;
      if (goingDown ? rect.top > viewport * 0.75 : rect.bottom < viewport * 0.25) return;
      if (rect.bottom <= 0 || rect.top >= viewport) return;

      event.preventDefault();

      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const aligned = headerBottom + Math.max(0, (viewport - headerBottom - rect.height) / 2);
      const offset = rect.top - aligned;
      if (Math.abs(offset) > 2) {
        // Durante o encaixe o wheel é engolido (inclusive a inércia do trackpad): é o que
        // dá a sensação de a página "travar" na galeria em vez de passar direto por ela.
        if (!aligning) {
          aligning = true;
          window.scrollTo({ top: window.scrollY + offset, behavior: "smooth" });
          window.setTimeout(() => {
            aligning = false;
          }, ALIGN_MS);
        }
        return;
      }
      if (aligning) return;

      const raw = target.current + event.deltaY / WHEEL_PER_SLOT;
      target.current = Math.min(last, Math.max(0, raw));

      scheduleSnap();
      loop();
    };

    /* --- arrasto (pointer: dedo, mouse ou caneta) ---------------------------------- */

    let lastX = 0;
    let lastY = 0;
    let travelX = 0;
    let travelY = 0;
    let axis: "x" | "y" | null = null;
    let dragging = false;
    /** Ponteiro que está conduzindo o gesto — ignora qualquer outro que aparecer no meio
     *  (ex.: segundo dedo tocando a tela sem soltar o primeiro). */
    let activePointerId: number | null = null;

    const onPointerDown = (event: PointerEvent) => {
      // Só o botão principal do mouse arrasta — direito/meio seguem livres para o menu
      // de contexto e outros usos. Touch e caneta não têm este conceito (`button` é 0).
      if (event.pointerType === "mouse" && event.button !== 0) return;
      restart();
      // Suprime o drag-and-drop nativo de imagem que o mousedown dispararia por cima
      // deste gesto — sem isto o navegador arrasta um "fantasma" da mídia junto da fita.
      event.preventDefault();
      dragging = true;
      activePointerId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      travelX = 0;
      travelY = 0;
      axis = null;
      // Mantém o gesto vivo mesmo se o ponteiro sair do retângulo do arco antes de soltar.
      drag?.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || !live.current.enabled || event.pointerId !== activePointerId) return;
      restart();

      // Positivo = avança na fita: arrastar pra CIMA (como rolar a página pra baixo) ou
      // pra ESQUERDA (como empurrar o carrossel).
      const stepX = lastX - event.clientX;
      const stepY = lastY - event.clientY;
      lastX = event.clientX;
      lastY = event.clientY;
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
      const raw = target.current + step / DRAG_PER_SLOT;

      if (raw < 0 || raw > last) {
        // Ponta da fita: o gesto passa a levar a página. É o que evita o carrossel virar
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

    const onPointerEnd = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return;
      dragging = false;
      activePointerId = null;
      axis = null;
    };

    // No `window`, não em `node`: o gesto precisa valer com o mouse em QUALQUER ponto da
    // página, não só sobre a galeria — quem decide se intercepta é a guarda de visibilidade
    // acima (o retângulo do stage), não a posição do cursor.
    window.addEventListener("wheel", onWheel, { passive: false });
    const drag = dragRef.current;
    drag?.addEventListener("pointerdown", onPointerDown);
    drag?.addEventListener("pointermove", onPointerMove, { passive: false });
    drag?.addEventListener("pointerup", onPointerEnd);
    drag?.addEventListener("pointercancel", onPointerEnd);

    return () => {
      window.removeEventListener("wheel", onWheel);
      observer.disconnect();
      window.removeEventListener("scroll", restart);
      if (idleTimer != null) clearTimeout(idleTimer);
      drag?.removeEventListener("pointerdown", onPointerDown);
      drag?.removeEventListener("pointermove", onPointerMove);
      drag?.removeEventListener("pointerup", onPointerEnd);
      drag?.removeEventListener("pointercancel", onPointerEnd);
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
    // Clique na barra de seções ou num quadro: interação, então o autoplay espera de novo.
    restartIdle.current();
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
