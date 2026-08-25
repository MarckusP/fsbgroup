"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LAYER_COUNT, type PoolItem } from "@/content/media-pool";

/** Identidade de um item para o dedup do baralho: `.mp4` para vídeo, `.src` para imagem. */
const identity = (item: PoolItem) => (item.kind === "video" ? item.mp4 : item.src);

/** Distância acumulada do cursor, em px, que dispara a troca de imagem. */
const SWAP_DISTANCE = 120;
/** Amplitude do parallax, em px, na camada mais profunda. */
const PARALLAX_RANGE = 26;
/** Suavização do parallax por frame (0–1). Baixo = câmera pesada. */
const LERP = 0.09;
/** Sem hover (touch), o baralho avança sozinho neste intervalo. */
const AUTOPLAY_MS = 2600;

export type DeckLayer = {
  /** Cresce sempre; serve de key e garante animação de entrada em cada troca. */
  readonly id: number;
  readonly media: PoolItem;
  /** Vetor unitário do movimento do cursor no instante da troca. */
  readonly dx: number;
  readonly dy: number;
  /** Rotação determinística por camada, entre -1 e 1. */
  readonly tilt: number;
};

/** Embaralha uma cópia (Fisher-Yates) sem tocar no array original. */
function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Traduz o movimento do mouse numa sequência de imagens (§10).
 *
 * O objetivo do briefing é "a câmera está atravessando diferentes trabalhos da FSB":
 * não é parallax comum, é a distância percorrida pelo cursor que puxa a próxima imagem.
 *
 * Custo por frame: uma única escrita de duas CSS custom properties no container.
 * As camadas leem essas variáveis no próprio transform, então o React não re-renderiza
 * durante o movimento — só nas trocas discretas de imagem.
 */
export function usePointerDeck({
  pool,
  enabled,
}: {
  pool: readonly PoolItem[];
  enabled: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [layers, setLayers] = useState<DeckLayer[]>([]);

  // Estado de alta frequência mora em refs: nada disso deve causar render.
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const travelled = useRef(0);
  const heading = useRef({ x: 0, y: -1 });
  const frame = useRef(0);

  const deck = useRef<PoolItem[]>([]);
  const counter = useRef(0);
  // Guardado em ref, não lido de `layers`: assim `draw` e `push` ficam estáveis e o
  // loop de rAF não é destruído e recriado a cada troca de imagem.
  const lastSrc = useRef<string | null>(null);

  const draw = useCallback((): PoolItem => {
    if (deck.current.length === 0) {
      const reshuffled = shuffle(pool);
      // Evita que o último item exibido reapareça logo na virada do baralho.
      if (
        reshuffled.length > 1 &&
        identity(reshuffled[reshuffled.length - 1]) === lastSrc.current
      ) {
        [reshuffled[0], reshuffled[reshuffled.length - 1]] = [
          reshuffled[reshuffled.length - 1],
          reshuffled[0],
        ];
      }
      deck.current = reshuffled;
    }
    const media = deck.current.pop() as PoolItem;
    lastSrc.current = identity(media);
    return media;
  }, [pool]);

  const push = useCallback(
    (dx: number, dy: number, forced?: PoolItem) => {
      const id = ++counter.current;
      const media = forced ?? draw();
      if (forced) lastSrc.current = identity(forced);
      setLayers((prev) =>
        [
          {
            id,
            media,
            dx,
            dy,
            // Alterna o lado da inclinação para o empilhamento não ficar simétrico demais.
            tilt: ((id * 37) % 200) / 100 - 1,
          },
          ...prev,
        ].slice(0, LAYER_COUNT),
      );
    },
    [draw],
  );

  // Pilha inicial: as primeiras imagens da curadoria, na ordem, para o card já ter
  // profundidade antes do primeiro hover. Ordem reversa porque `push` insere na frente —
  // assim pool[0] termina como a imagem visível.
  useEffect(() => {
    for (let i = Math.min(LAYER_COUNT, pool.length) - 1; i >= 0; i--) {
      push(0, -1, pool[i]);
    }
    // Só no mount: refazer a pilha a cada mudança de `pool` não faria sentido aqui.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------------------------------------------------- movimento do cursor */

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !enabled) return;

    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      target.current = { x: nx, y: ny };

      if (event.movementX || event.movementY) {
        const dist = Math.hypot(event.movementX, event.movementY);
        travelled.current += dist;
        if (dist > 0.5) {
          heading.current = {
            x: event.movementX / dist,
            y: event.movementY / dist,
          };
        }
      }
    };

    node.addEventListener("pointermove", onMove, { passive: true });
    return () => node.removeEventListener("pointermove", onMove);
  }, [enabled]);

  /* ------------------------------------------------------------- loop de rAF */

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !enabled || !active) {
      // Ao sair, devolve o parallax ao repouso.
      node?.style.setProperty("--pdx", "0px");
      node?.style.setProperty("--pdy", "0px");
      node?.style.setProperty("--pnx", "0");
      node?.style.setProperty("--pny", "0");
      return;
    }

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * LERP;
      current.current.y += (target.current.y - current.current.y) * LERP;

      node.style.setProperty(
        "--pdx",
        `${(current.current.x * PARALLAX_RANGE).toFixed(2)}px`,
      );
      node.style.setProperty(
        "--pdy",
        `${(current.current.y * PARALLAX_RANGE).toFixed(2)}px`,
      );
      // As mesmas coordenadas sem unidade (-0.5…0.5). O card multiplica por `deg` para
      // inclinar em 3D — o tilt sai de graça deste loop, sem um segundo rAF.
      node.style.setProperty("--pnx", current.current.x.toFixed(4));
      node.style.setProperty("--pny", current.current.y.toFixed(4));

      if (travelled.current >= SWAP_DISTANCE) {
        travelled.current = 0;
        push(heading.current.x, heading.current.y);
      }

      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [enabled, active, push]);

  /* ------------------------------------------ fallback sem hover (touch) */

  const [autoplay, setAutoplay] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const query = window.matchMedia("(hover: none)");
    const sync = () => setAutoplay(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [enabled]);

  useEffect(() => {
    if (!autoplay || !enabled) return;
    const timer = setInterval(() => push(0, -1), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [autoplay, enabled, push]);

  const handlers = useMemo(
    () => ({
      onPointerEnter: () => setActive(true),
      onPointerLeave: () => {
        setActive(false);
        target.current = { x: 0, y: 0 };
      },
      onFocus: () => setActive(true),
      onBlur: () => setActive(false),
    }),
    [],
  );

  return { containerRef, layers, active, handlers };
}
