"use client";

import { ArrowUpRight, Play } from "lucide-react";
import { memo, type RefCallback } from "react";
import { siteOf, type PoolItem } from "@/content/media-pool";

/** Raio da mídia interna — um pouco menor que o da moldura (`30px` em `.glass`),
 *  senão o "vidro" ao redor não lê como uma beirada. */
const MEDIA_RADIUS = 16;

/** Limites de proporção. O acervo vai de 0.56 (retrato em pé) a 2.26 (panorâmica), e os
 *  dois extremos quebram o arco: o retrato estoura a altura do container, a panorâmica
 *  fica larga demais e encosta nos vizinhos. Fora dessa faixa a mídia é levemente
 *  recortada pelo `object-cover` — dentro dela, aparece na proporção exata do master. */
const ASPECT_MIN = 0.68;
const ASPECT_MAX = 2;

/**
 * Largura e proporção de um quadro a partir das dimensões reais do master.
 *
 * A proporção é a do arquivo; o que é normalizado é a ÁREA, não a largura. Com largura
 * fixa, uma panorâmica (2.26) ficaria três vezes mais baixa que um retrato (0.56) e
 * sumiria no meio do arco mesmo estando em destaque. Mantendo a área constante, todo
 * quadro tem o mesmo peso visual e cada um continua com o formato do seu próprio master:
 * o retrato fica estreito e alto, a panorâmica larga e baixa.
 */
function sizeOf(item: PoolItem) {
  const aspect = Math.min(ASPECT_MAX, Math.max(ASPECT_MIN, item.width / item.height));
  // Lado do quadrado de mesma área (`--arc-base`) × √proporção = largura que preserva a
  // área. A altura sai sozinha do `aspect-ratio`.
  return { aspect, width: `calc(var(--arc-base) * ${Math.sqrt(aspect).toFixed(4)})` };
}

/**
 * Um quadro "liquid glass" do carrossel em arco de uma seção.
 *
 * **Posição, escala, giro, brilho e opacidade NÃO vêm daqui.** Quem escreve isso é o laço
 * de animação, direto no DOM, via o `ref` que este componente expõe (ver
 * `UniverseMediaArc.applyFrame`). Se essas propriedades estivessem no `style` do React,
 * qualquer re-render sobrescreveria o que o laço acabou de escrever, e o movimento
 * contínuo do scroll voltaria a virar uma sucessão de saltos.
 *
 * O tamanho base do elemento é o do quadro EM DESTAQUE, e os laterais só encolhem — de
 * propósito: ampliar acima de 1 borraria a moldura de vidro e a imagem justamente no
 * quadro que está sendo olhado de perto.
 *
 * É `memo`: durante um movimento da fita o índice em destaque muda a cada quadro que passa
 * pelo centro, e sem isso os ~32 cards re-renderizariam a cada um deles. Por isso as props
 * são todas estáveis — `onSelect` recebe o `index` em vez de um arrow por card, o `site`
 * é derivado aqui dentro em vez de vir pronto de fora, e o `ref` vem de uma lista fixa.
 *
 * A moldura é um `<div>` com um `<button>` cobrindo a mídia, e não um `<button>` por fora
 * de tudo: o quadro em destaque pode carregar o link do site que ele mostra (`site`), e
 * `<a>` dentro de `<button>` é HTML inválido. Clicar no quadro o traz pro centro — o mesmo
 * caminho serve para teclado, para touch e para quem navega com `prefers-reduced-motion`
 * (onde o scroll do stage fica desligado).
 */
export const GlassMediaCard = memo(function GlassMediaCard({
  ref,
  item,
  index,
  featured,
  playVideo,
  reachable,
  loadMedia = true,
  eager = false,
  enterDelayMs = 0,
  label,
  openSiteLabel,
  onSelect,
}: {
  ref?: RefCallback<HTMLDivElement>;
  item: PoolItem;
  /** Posição na fita — devolvida a `onSelect`, para o callback poder ser estável. */
  index: number;
  featured: boolean;
  /** O destaque já parou tempo bastante para valer a pena montar o `<video>`. */
  playVideo: boolean;
  /** Está dentro da janela visível do arco — define foco e leitura por assistivos. */
  reachable: boolean;
  /** Está perto o bastante do destaque para valer a pena baixar a mídia. A fita inteira
   *  fica montada, então sem isto o navegador buscaria os ~36 posters de uma vez. */
  loadMedia?: boolean;
  eager?: boolean;
  /** Atraso da cascata de entrada do arco, em ms — ver `.arc-card-in` no globals.css. */
  enterDelayMs?: number;
  label: string;
  /** Template do rótulo do link — `{host}` vira o domínio. */
  openSiteLabel: string;
  onSelect: (index: number) => void;
}) {
  const { aspect, width } = sizeOf(item);
  /** Site que este trabalho representa, quando o nome do master traz o domínio. */
  const site = siteOf(item);
  // No arco o destaque é o estado natural de "aberto", então é ele que toca o vídeo — na
  // galeria antiga isso era amarrado ao hover, que aqui não seleciona nada.
  const asVideo = item.kind === "video" && playVideo;
  const posterSrc = item.kind === "video" ? item.poster : item.src;

  return (
    <div
      ref={ref}
      aria-hidden={!reachable}
      style={{
        // Inline, não via classe Tailwind `absolute`: `.glass` já define
        // `position: relative` no CSS global, e a ordem de cascata entre um utilitário
        // custom e um do próprio Tailwind não é garantida — inline sempre vence.
        position: "absolute",
        // `.glass` declara `transition` como shorthand incluindo `filter`. Como o laço de
        // animação reescreve `filter` a cada frame, deixar essa transição ligada faria o
        // navegador iniciar uma interpolação de 0.6s a cada frame — o movimento ficaria
        // pastoso e atrasado. Só o halo (`box-shadow`) continua transicionando.
        transitionProperty: "box-shadow",
        transitionDuration: "600ms",
        transitionTimingFunction: "var(--ease-arc)",
      }}
      // Sem classe de largura: um elemento `position: absolute` sem `width` encolhe em
      // torno do conteúdo, então a moldura de vidro acompanha a proporção da mídia em vez
      // de impor um formato próprio a ela.
      className={`glass ${featured ? "glass-active" : ""}`}
    >
      {/* A cascata de entrada mora AQUI, na mídia interna, e não no `<div>` de fora:
          aquele é do laço de animação, que reescreve `opacity`, `transform` e `filter` a
          cada frame e sobrescreveria qualquer animação posta nele. Este elemento o laço
          nunca toca. Roda uma vez, na primeira pintura da página — a fita é montada uma
          só vez e nunca remonta ao trocar de seção. */}
      <div
        className="pool-tint arc-card-in relative overflow-hidden"
        style={{
          width,
          aspectRatio: aspect,
          borderRadius: MEDIA_RADIUS,
          animationDelay: `${enterDelayMs}ms`,
        }}
      >
        {/* O poster fica montado inclusive ATRÁS do vídeo. Antes o `<video>` substituía
            o `<img>` ao entrar no centro (e vice-versa ao sair): trocar o elemento é uma
            substituição instantânea, impossível de animar, e era ela que fazia a passagem
            parecer um corte seco. Só sai de cena longe do destaque (`loadMedia`), onde o
            quadro já está invisível e baixar a imagem seria desperdício. */}
        {loadMedia && (
          <img
            src={posterSrc}
            width={item.width}
            height={item.height}
            alt=""
            decoding="async"
            loading={eager ? "eager" : "lazy"}
            className="pool-grade h-full w-full object-cover"
          />
        )}

        {asVideo && <FeaturedVideo item={item} />}

        {item.kind === "video" && !asVideo && (
          <span aria-hidden className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="glass flex h-8 w-8 items-center justify-center !rounded-full !p-0">
              <Play
                className="h-3 w-3 translate-x-px text-bone"
                fill="currentColor"
                strokeWidth={0}
              />
            </span>
          </span>
        )}

        {/* O alvo de "trazer pro centro". Cobre a mídia inteira, mas fica ABAIXO da pílula
            do site no `z` — no quadro em destaque o clique no domínio abre o site, e o
            clique em qualquer outro ponto continua sendo do carrossel. */}
        <button
          type="button"
          aria-label={label}
          disabled={!reachable}
          onClick={() => onSelect(index)}
          style={{ cursor: featured ? "default" : "pointer" }}
          className="absolute inset-0 z-20"
        />

        {/* Só no destaque: nos laterais o card está a menos da metade do tamanho e
            desfocado, e um domínio ali seria ilegível. */}
        {site && featured && (
          <a
            href={site.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={openSiteLabel.replace("{host}", site.host)}
            className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-electric/60 bg-midnight-deep/75 px-3 py-1.5 font-display text-[0.6875rem] font-semibold tracking-wide text-bone backdrop-blur-md transition-all duration-300 ease-[var(--ease-hover)] hover:border-electric hover:bg-electric/25 hover:shadow-[0_0_22px_-6px_var(--color-electric)]"
          >
            {site.host}
            <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
          </a>
        )}
      </div>
    </div>
  );
});

/**
 * O vídeo do quadro em destaque, sobreposto ao poster.
 *
 * Sem fade por estado: o `<video>` já pinta o próprio `poster` enquanto bufferiza, e por
 * baixo dele existe a `<img>` do MESMO poster, sempre montada. A continuidade está
 * garantida dos dois lados, então não há frame preto para esconder — e tentar animar a
 * entrada por `onCanPlay` só reintroduz um bug de timing: no primeiro carregamento o vídeo
 * já vem com dados antes da hidratação anexar os handlers, o evento dispara no vazio e o
 * vídeo fica invisível para sempre.
 */
function FeaturedVideo({ item }: { item: Extract<PoolItem, { kind: "video" }> }) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster={item.poster}
      width={item.width}
      height={item.height}
      className="pool-grade absolute inset-0 h-full w-full object-cover"
    >
      <source src={item.webm} type="video/webm" />
      <source src={item.mp4} type="video/mp4" />
    </video>
  );
}
