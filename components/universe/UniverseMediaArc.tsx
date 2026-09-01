"use client";

import { useImperativeHandle, useLayoutEffect, useRef, type RefObject } from "react";
import { siteOf, type PoolItem } from "@/content/media-pool";
import { GlassMediaCard } from "./GlassMediaCard";

/** Quantas imagens de cada seção entram na fita — e, portanto, quanto scroll a seção
 *  custa antes de a seguinte assumir o centro.
 *
 *  O anel de `offsetFor` hoje é a fita INTEIRA (~32 quadros em /company), não uma seção,
 *  então a vaga onde cada quadro dá a volta já está muito longe do centro — o mínimo de 9
 *  que essa volta exigia deixou de ser uma restrição. O que este número calibra agora é
 *  ritmo: quantas imagens de uma seção se atravessa antes de a próxima assumir o centro. */
export const ARC_COUNT = 9;

/** Quantos quadros aparecem de cada lado do destaque (o conceito mostra 3). */
const VISIBLE_SIDE = 3;

/** Meia-largura do arco, em % do container — onde fica o quadro mais distante.
 *  Deixa folga pro quadro da ponta caber inteiro dentro do `overflow-hidden`. */
const RADIUS_X = 42;
/** Quanto os quadros das pontas SOBEM em relação ao destaque, em % da altura.
 *  Sobem, não descem: é o mesmo sentido do trilho, que também abre pra cima nas pontas —
 *  com os dois em sentidos opostos, o arco e a linha brigavam visualmente. */
const RADIUS_Y = 14;
/** Altura do centro do quadro em destaque, em % do container. */
const CENTER_Y = 52;

/** Os quadros que uma seção contribui para a fita. */
export const arcItems = (media: readonly PoolItem[]) => media.slice(0, ARC_COUNT);

/**
 * Distância, em quadros, até onde a mídia é realmente carregada.
 *
 * A fita inteira (~32 quadros em /company, ~36 em /events) fica montada o tempo todo, e
 * todo card vive dentro do container visível — `loading="lazy"` sozinho não seguraria nada,
 * o navegador buscaria os ~36 posters no primeiro paint. Então o `src` só é entregue perto
 * do destaque. A folga sobre `placementFor` (que já zera a opacidade em 3.6) é de propósito:
 * o quadro carrega enquanto ainda está invisível e nunca aparece vazio, mesmo num scroll
 * rápido.
 */
const LOAD_WINDOW = 8;

/** Deslocamento horizontal, em px, que conta como swipe (touch não dispara `wheel`). */
const SWIPE_THRESHOLD = 40;

/**
 * Caixa do arco: altura e `--arc-base`.
 *
 * Fica aqui (junto da geometria que ela calibra) mas é aplicada pelo `UniverseStage`, num
 * wrapper que NÃO remonta na troca de seção. É o que garante que a altura do stage não
 * muda durante a transição — se mudasse, a guarda de `useArcScrub` veria parte do stage
 * fora da tela e devolveria o gesto pro navegador, fazendo a página descer até o
 * formulário no meio da troca.
 *
 * A altura é limitada pelo que sobra da primeira tela, não só por um valor fixo: `100svh`
 * menos o cabeçalho da página, a faixa de seções, os vãos e os botões. Se o arco passar
 * disso, o stage inteiro deixa de caber no viewport e a mesma guarda devolve o scroll ao
 * navegador. `--arc-base` acompanha pelo mesmo fator (0.68 ≈ 1/1.47, a razão entre o
 * lado-base e a altura necessária para o retrato mais alto caber): encolher o container
 * sem encolher o card só faria o card ser recortado.
 */
export const ARC_BOX =
  "h-[19rem] [--arc-base:12.25rem] sm:h-[21.5rem] sm:[--arc-base:14.25rem] md:h-[min(21.5rem,calc(100svh-32rem))] md:[--arc-base:min(14.25rem,calc((100svh-32rem)*0.68))] lg:h-[min(25rem,calc(100svh-34rem))] lg:[--arc-base:min(17rem,calc((100svh-34rem)*0.68))]";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Deslocamento de um quadro em relação ao destaque, pelo caminho MAIS CURTO no anel — é
 * isto que torna o arco circular. O anel é a fita inteira, todas as seções juntas: é daí
 * que sai a continuidade, porque o vizinho à direita do último quadro de uma seção é
 * simplesmente o primeiro da seguinte.
 *
 * Aceita posição fracionária: com o scroll contínuo, 2.4 é uma posição válida, entre dois
 * quadros. Sem dar a volta, a fita abriria com o destaque no primeiro quadro e nada à
 * esquerda dele — o arco ficaria torto justamente no primeiro quadro que a pessoa vê.
 *
 * Só a APARÊNCIA dá a volta: o índice continua linear (0…n-1) e o scrub o mantém preso a
 * essa faixa, então as pontas da fita continuam devolvendo o scroll ao navegador.
 */
function offsetFor(index: number, position: number, count: number) {
  const half = count / 2;
  const raw = (((index - position) % count) + count) % count;
  return raw > half ? raw - count : raw;
}

/**
 * Posição, profundidade e opacidade de um quadro a partir do seu deslocamento.
 *
 * Todas as curvas aqui são CONTÍNUAS, não escadas por índice: o arco é dirigido por uma
 * posição fracionária vinda do scroll (`useArcScrub`), então qualquer degrau numa destas
 * funções apareceria como um solavanco no meio do gesto.
 *
 * O eixo X usa `sin` e o Y usa `1 - cos` do mesmo ângulo: é literalmente um ponto sobre
 * uma elipse, então os quadros se espalham mais perto do centro e se comprimem nas pontas
 * enquanto sobem — a leitura de perspectiva do conceito, sem `perspective` de verdade (que
 * exigiria `preserve-3d` no pai e não conviveria com o `overflow-hidden` do container).
 */
function placementFor(offset: number) {
  const distance = Math.abs(offset);
  // Trava em ±1: passando de π/2 o seno voltaria a diminuir e os quadros invisíveis
  // caminhariam de volta pra dentro do arco.
  const t = clamp(offset / VISIBLE_SIDE, -1, 1);
  const angle = (t * Math.PI) / 2;

  return {
    xPct: 50 + Math.sin(angle) * RADIUS_X,
    yPct: CENTER_Y - (1 - Math.cos(angle)) * RADIUS_Y,
    // O primeiro degrau (0.42) é o que paga o aumento do `--arc-base`: o destaque cresceu
    // pra caber mais detalhe e os laterais encolheram na mesma medida pra abrir esse
    // espaço. Entre 0 e 1 a queda é suavizada (smoothstep) em vez de um salto seco.
    scale:
      distance >= 1
        ? 0.42 * Math.pow(0.88, distance - 1)
        : 1 + (0.42 - 1) * (distance * distance * (3 - 2 * distance)),
    // Negativo à direita: numa curva que sobe nas pontas, a tangente à direita aponta pra
    // cima, então o quadro tomba no sentido anti-horário pra acompanhar a linha.
    rotate: -t * 7,
    // Cai devagar: soma-se ao que a mídia já sofre por conta própria (`.pool-grade`
    // escurece e dessatura, `.pool-tint` joga a cor da marca por cima) e boa parte do
    // acervo é foto noturna — uma queda agressiva apagava os laterais até virarem
    // retângulos pretos.
    brightness: Math.max(0.66, 1.06 - distance * 0.13),
    blur: Math.min(distance * 0.7, 2.2),
    // Zera ANTES da vaga onde o quadro dá a volta no anel, pra travessia ser invisível.
    opacity: distance <= 2.4 ? 1 : distance >= 3.6 ? 0 : 1 - (distance - 2.4) / 1.2,
    z: Math.round(60 - distance),
  };
}

/** O que o `UniverseStage` chama a cada frame do scroll. */
export type ArcHandle = { applyFrame: (position: number) => void };

/**
 * Um quadro da fita: a mídia e a que seção ela pertence.
 *
 * A fita é achatada de propósito — todas as seções numa lista só, montada uma única vez.
 * É isso que faz a galeria ser contínua: chegando ao fim das imagens de uma seção, as vagas
 * à direita já estão ocupadas pelas primeiras da seguinte, sem remonte e sem corte.
 */
export type ArcFrame = {
  readonly item: PoolItem;
  readonly sectionIndex: number;
  /** Número do quadro DENTRO da seção — é o que vai no rótulo acessível. */
  readonly numberInSection: number;
};

/**
 * Carrossel em arco de /company e /events — uma fita contínua com TODAS as seções.
 *
 * Um quadro em destaque no centro, os vizinhos recuando ao longo de um trilho elíptico. As
 * seções são faixas dentro da mesma fita: o quadro à direita do último de uma seção é o
 * primeiro da próxima, então a galeria nunca "acaba" nem recomeça — quem troca é só o
 * texto ao lado, quando o destaque cruza a fronteira.
 *
 * A posição é CONTÍNUA e vem do scroll (`useArcScrub`, em `UniverseStage`): o laço de
 * animação chama `applyFrame` e este componente escreve `transform`/`filter` direto no
 * DOM, sem passar pelo React — mesmo padrão de `usePointerDeck`. É por isso que as
 * posições NÃO estão no `style` de cada card: se estivessem, o próximo render do React
 * sobrescreveria o que o laço acabou de escrever.
 *
 * O React só reage ao índice arredondado (`activeIndex`), do qual dependem as coisas
 * discretas: qual vídeo toca, o link do site e o que é focável.
 *
 * A navegação principal é o scroll. Aqui ficam os caminhos que ele não cobre: clicar num
 * quadro lateral o traz para o centro (também é o caminho de quem usa
 * `prefers-reduced-motion`, onde o scroll fica desligado), as setas ←/→ no teclado, e o
 * swipe horizontal no touch, onde `wheel` nunca dispara.
 */
export function UniverseMediaArc({
  ref,
  frames,
  activeIndex,
  onSelect,
  galleryLabel,
  imageLabel,
  openSiteLabel,
}: {
  ref?: RefObject<ArcHandle | null>;
  /** A fita inteira, de todas as seções, na ordem da navegação. */
  frames: readonly ArcFrame[];
  /** Índice arredondado na fita — o que está em destaque para efeitos de estado. */
  activeIndex: number;
  onSelect: (index: number) => void;
  galleryLabel: string;
  /** Template do rótulo de cada quadro — `{n}` vira o número da imagem. */
  imageLabel: string;
  /** Template do rótulo do link de site — `{host}` vira o domínio. */
  openSiteLabel: string;
}) {
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const swipeStart = useRef<number | null>(null);

  const applyFrame = (position: number) => {
    for (let index = 0; index < frames.length; index += 1) {
      const node = cards.current[index];
      if (!node) continue;
      const placement = placementFor(offsetFor(index, position, frames.length));
      node.style.left = `${placement.xPct}%`;
      node.style.top = `${placement.yPct}%`;
      node.style.zIndex = String(placement.z);
      node.style.opacity = String(placement.opacity);
      node.style.pointerEvents = placement.opacity > 0 ? "auto" : "none";
      node.style.transform = `translate(-50%, -50%) rotate(${placement.rotate}deg) scale(${placement.scale})`;
      node.style.filter = `blur(${placement.blur}px) brightness(${placement.brightness})`;
    }
  };

  useImperativeHandle(ref, () => ({ applyFrame }));

  // Primeira pintura: o laço só roda quando há movimento, então sem isto os quadros
  // ficariam empilhados no canto até o primeiro scroll.
  useLayoutEffect(() => {
    applyFrame(activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = (delta: number) => {
    const next = activeIndex + delta;
    if (next < 0 || next >= frames.length) return;
    onSelect(next);
  };

  return (
    <div
      role="group"
      aria-label={galleryLabel}
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        step(event.key === "ArrowRight" ? 1 : -1);
      }}
      // Só o touch/caneta vira swipe: com o mouse, arrastar sobre um card é o começo de um
      // clique, e tratá-lo como swipe roubaria o clique-para-centralizar.
      onPointerDown={(event) => {
        swipeStart.current = event.pointerType === "mouse" ? null : event.clientX;
      }}
      onPointerUp={(event) => {
        const start = swipeStart.current;
        swipeStart.current = null;
        if (start === null) return;
        const travel = event.clientX - start;
        if (Math.abs(travel) < SWIPE_THRESHOLD) return;
        step(travel < 0 ? 1 : -1);
      }}
      // A altura, o `--arc-base` e o `overflow-hidden` vivem no wrapper persistente do
      // `UniverseStage` (ver `ARC_BOX`), não aqui: este elemento remonta a cada troca de
      // seção e a altura precisa sobreviver à troca. O recorte também é de lá — os quadros
      // das pontas ficam propositalmente perto da borda e sem ele vazariam por cima da
      // coluna de texto ao lado. (`overflow-hidden` no wrapper também é o que continua
      // impedindo `perspective`/`preserve-3d` aqui dentro.)
      className="relative h-full w-full touch-pan-y select-none"
    >
      {frames.map((frame, index) => {
        const distance = Math.abs(offsetFor(index, activeIndex, frames.length));
        const { item } = frame;
        return (
          <GlassMediaCard
            key={item.kind === "video" ? item.mp4 : item.src}
            ref={(node) => {
              cards.current[index] = node;
            }}
            item={item}
            featured={index === activeIndex}
            // Estado discreto (foco, `aria-hidden`, carregamento) sai do índice
            // arredondado, não da posição contínua: não faz sentido um quadro entrar e sair
            // da ordem de tabulação no meio de um gesto de scroll.
            reachable={distance <= VISIBLE_SIDE}
            loadMedia={distance <= LOAD_WINDOW}
            eager={distance <= VISIBLE_SIDE}
            // Cascata da primeira pintura, do quadro em destaque para fora — não da
            // esquerda para a direita: é no centro do arco que o olho está quando a página
            // abre. Limitada a `VISIBLE_SIDE` porque além disso o quadro já nasce invisível
            // (ver `placementFor`).
            enterDelayMs={Math.min(distance, VISIBLE_SIDE) * 60}
            label={imageLabel.replace("{n}", String(frame.numberInSection))}
            site={siteOf(item)}
            openSiteLabel={openSiteLabel}
            onSelect={() => onSelect(index)}
          />
        );
      })}
    </div>
  );
}

/* --- Trilho decorativo ---------------------------------------------------------- */

/** Extremos e curvatura do trilho, no mesmo sistema de % do `placementFor`. */
const RAIL = { x0: 2, y0: 46, cx: 50, cy: 104, x1: 98, y1: 46 };
/** Pontos de luz e cubos de vidro, por `t` ao longo da curva. */
const RAIL_DOTS = [0.18, 0.5, 0.82];
const RAIL_CUBES = [0.07, 0.3, 0.7, 0.93];

/** Ponto da bezier quadrática do trilho em `t` — usado para pousar pontos e cubos sobre a
 *  linha sem repetir as coordenadas à mão. */
function pointAt(t: number) {
  const inv = 1 - t;
  return {
    x: inv * inv * RAIL.x0 + 2 * inv * t * RAIL.cx + t * t * RAIL.x1,
    y: inv * inv * RAIL.y0 + 2 * inv * t * RAIL.cy + t * t * RAIL.y1,
  };
}

/**
 * A "órbita" atrás dos quadros: a linha elíptica com pontos de luz e os cubinhos de vidro
 * do conceito. Puramente decorativa — fica abaixo dos cards no `z` e fora da árvore de
 * acessibilidade.
 *
 * A linha é um SVG esticado (`preserveAspectRatio="none"`, com `vectorEffect` pra a
 * espessura não distorcer junto); pontos e cubos são elementos posicionados em %, e não
 * partes desse SVG, justamente pra NÃO serem esticados com ele.
 *
 * É montado pelo `UniverseStage`, IRMÃO do arco e fora do que remonta na troca de seção: o
 * trilho é o mesmo em todas as seções, e vê-lo piscar junto denunciava a troca. Parado, a
 * transição lê como os quadros se recompondo sobre um trilho que sempre esteve ali.
 */
export function ArcRail() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
        <defs>
          <linearGradient id="arc-rail-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgb(var(--glass-tint))" stopOpacity="0" />
            <stop offset="22%" stopColor="rgb(var(--glass-tint))" stopOpacity="0.35" />
            <stop offset="50%" stopColor="var(--color-electric)" stopOpacity="0.6" />
            <stop offset="78%" stopColor="rgb(var(--glass-tint))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(var(--glass-tint))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`M ${RAIL.x0} ${RAIL.y0} Q ${RAIL.cx} ${RAIL.cy} ${RAIL.x1} ${RAIL.y1}`}
          stroke="url(#arc-rail-stroke)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {RAIL_DOTS.map((t) => {
        const { x, y } = pointAt(t);
        return <span key={`dot-${t}`} className="arc-dot" style={{ left: `${x}%`, top: `${y}%` }} />;
      })}

      {RAIL_CUBES.map((t) => {
        const { x, y } = pointAt(t);
        return <ArcCube key={`cube-${t}`} left={x} top={y} />;
      })}
    </div>
  );
}

/**
 * Cubo de vidro do trilho — isométrico em SVG (três faces), não CSS 3D: dá o mesmo desenho
 * do conceito sem exigir `preserve-3d` num container que precisa de `overflow-hidden` (os
 * dois não convivem).
 */
function ArcCube({ left, top }: { left: number; top: number }) {
  return (
    <svg
      className="arc-cube absolute h-6 w-5 -translate-x-1/2 -translate-y-1/2 lg:h-7 lg:w-6"
      style={{ left: `${left}%`, top: `${top}%` }}
      viewBox="0 0 24 28"
      fill="none"
    >
      {/* Topo, face direita, face esquerda — do mais claro ao mais escuro, como uma luz
          vindo de cima e da direita (a mesma direção do reflexo de `.glass::before`). */}
      <path d="M12 2 22 8 12 14 2 8Z" fill="rgb(var(--glass-tint) / 0.30)" />
      <path d="M22 8 22 20 12 26 12 14Z" fill="rgb(var(--glass-tint) / 0.16)" />
      <path d="M2 8 12 14 12 26 2 20Z" fill="rgb(var(--glass-tint) / 0.07)" />
      <path
        d="M12 2 22 8 22 20 12 26 2 20 2 8 Z M12 14 L12 26 M12 14 L2 8 M12 14 L22 8"
        stroke="rgb(var(--glass-tint) / 0.45)"
        strokeWidth={0.7}
      />
    </svg>
  );
}
