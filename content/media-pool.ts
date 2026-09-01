import {
  companyPool,
  eventsPool,
  type PoolItem,
} from "./media-pool.generated";

/**
 * Curadoria sobre o inventário gerado.
 *
 * media-pool.generated.ts é o que existe em disco; aqui decidimos a ORDEM.
 * Isso importa: os primeiros itens de cada pool são os pré-carregados e os primeiros
 * a aparecer no hover, então os mais fortes vêm na frente.
 */

export type Universe = "events" | "company";

export type EventsSection = "weddings" | "socials" | "corporate" | "production";
export type CompanySection = "branding" | "product" | "content" | "web";
export type SectionOf<U extends Universe> = U extends "events"
  ? EventsSection
  : CompanySection;

/** Seções válidas por universo, na ordem em que aparecem na navegação. */
export const SECTIONS: { events: readonly EventsSection[]; company: readonly CompanySection[] } = {
  events: ["weddings", "socials", "corporate", "production"],
  company: ["branding", "product", "content", "web"],
};

/** Identidade de um item do pool para curadoria: o nome do arquivo que o representa —
 *  o `.webp` para imagem, o `.mp4` para vídeo (o poster é derivado do mesmo master). */
const fileName = (item: PoolItem) =>
  (item.kind === "video" ? item.mp4 : item.src).split("/").pop() ?? "";

/**
 * Itens que NÃO podem entrar no site, com o motivo.
 *
 * Os arquivos continuam em /public/media — só não são exibidos. Para reaproveitar
 * algum, basta remover a linha daqui. Ver a nota no README sobre substituições.
 */
const BLOCKED: Record<string, string> = {
  // Propaganda eleitoral brasileira com candidatos reais identificáveis (números,
  // nomes e rostos). Sugere posicionamento político da FSB e usa imagem de terceiros.
  "company-campanhas-publicitarias.webp": "material político de candidatos reais",
  // Campanha real de uma marca de terceiros com celebridade. Exibir como portfólio
  // implica que a FSB produziu a campanha do David Beckham.
  "company-product-luxury-perfum.webp": "campanha de marca/celebridade de terceiros",
  // Produto de marca identificável (Jimmy Choo) em destaque no quadro.
  "company-perfume-luxo.webp": "marca de terceiros em destaque",
  // Colagem com logos de marcas de terceiros (Dove, Crumbl, Rhode).
  "company-brand-campaigns.webp": "logos de marcas de terceiros",
  // Grade de campanha de marca de terceiros.
  "company-lifestyle-product.webp": "campanha de marca de terceiros",
  // Uniforme com a marca de um concorrente legível no quadro (perfocal.com).
  "events-fotografo-imprensa-evento.webp": "marca de concorrente legível",
  // Garrafa de Coca-Cola em destaque, rótulo e tampa legíveis no quadro inteiro.
  "company-commercial-product-soda.mp4": "marca de terceiros em destaque",
  // Garrafa de tequila Don Julio em destaque, rótulo legível.
  "company-perfum-2.mp4": "marca de terceiros em destaque",
  // Roupão com o nome do hotel bordado, legível — associa a FSB a uma rede real.
  "company-luxury-hotel-hospedagem.mp4": "marca de terceiros em destaque",
};

/**
 * Classificação por seção — a convenção nova.
 *
 * Um master novo chamado `events-production-drone-shot.mp4` já nasce classificado: o
 * segundo token do nome (depois do universo) bate com uma seção de `SECTIONS`, então
 * `sectionOf` resolve sozinho, sem tocar em código. É assim que "renomear o arquivo já
 * classifica" funciona — nenhuma lista para manter ao adicionar mídia nova.
 *
 * O inventário atual (~64 masters) foi nomeado antes dessa convenção existir, então cada
 * arquivo aqui precisa de uma entrada manual — mesmo padrão de `BLOCKED`/`FEATURED`
 * acima. Mapeamento de melhor esforço pelo conteúdo da imagem/vídeo; revisar se algum
 * item parecer no lugar errado.
 */
const SECTION_OVERRIDES: Record<string, EventsSection | CompanySection> = {
  // events → weddings
  "events-cople-flipingcamp.mp4": "weddings",
  "events-kissing-her-boyfriend.webp": "weddings",
  "events-photo-couple-cross-1.webp": "weddings",
  "events-photographer-wedding.webp": "weddings",
  "events-walking-sunset.webp": "weddings",
  // events → socials
  "events-aniversario-luxuoso.webp": "socials",
  // events → corporate
  "events-live-performace-indor.webp": "corporate",
  // events → production
  "events-photographer-press.webp": "production",
  "events-backstage-equipe-production.webp": "production",
  "events-backstage-equipe-production-2.webp": "production",
  "events-backstage-equipe-som.webp": "production",
  "events-cameras-cover-image.webp": "production",
  "events-cameras-cover-image-2.webp": "production",
  "events-dj-dance-road.webp": "production",
  "events-dj-mixing.webp": "production",
  "events-fotografo-imprensa-evento.webp": "production",
  "events-led-touring-festivals.webp": "production",
  "events-lighting-sound-technicians-television-operators-work-backstage-public-event.webp":
    "production",
  "events-photographer-lens.webp": "production",
  "events-stage-lighting.webp": "production",
  "events-wall-led-1.webp": "production",
  "events-wall-led-create-show-experience.webp": "production",
  // company → branding
  "company-brand-campaigns.webp": "branding",
  "company-campanhas-publicitarias.webp": "branding",
  "company-kindness-reflective.mp4": "branding",
  // company → product
  "company-commercial-product-soda.mp4": "product",
  "company-estudio-fotografico-1.webp": "product",
  "company-estudio-fotografico-modelo.webp": "product",
  "company-food-image.webp": "product",
  "company-food-restaurant.mp4": "product",
  "company-foto-produto-profissional-studio.webp": "product",
  "company-lifestyle-product.webp": "product",
  "company-luxury-hotel-hospedagem.mp4": "product",
  "company-maquiagem.webp": "product",
  "company-perfum-2.mp4": "product",
  "company-perfume-luxo.webp": "product",
  "company-refined-wood.mp4": "product",
  // company → content
  "company-gravacao-curso-1.webp": "content",
  "company-gravacao-curso-2.webp": "content",
  "company-gravacao-curso-3.webp": "content",
};

/**
 * Seção de um item do pool: primeiro tenta o segundo token do nome do arquivo (a
 * convenção `<universo>-<seção>-<descrição>`); se não bater com nenhuma seção
 * conhecida, cai para `SECTION_OVERRIDES`.
 */
export function sectionOf<U extends Universe>(
  universe: U,
  item: PoolItem,
): SectionOf<U> | undefined {
  const name = fileName(item);
  const rest = name.slice(universe.length + 1); // remove "events-"/"company-"
  const candidate = rest.split("-")[0];
  const known = SECTIONS[universe] as readonly string[];
  if (known.includes(candidate)) return candidate as SectionOf<U>;
  const override = SECTION_OVERRIDES[name];
  return override as SectionOf<U> | undefined;
}

/**
 * Sufixos de domínio reconhecidos no nome do arquivo, do mais específico para o menos —
 * `com-br` tem que ser testado antes de `com`, senão `...-com-br` viraria `br.com`.
 */
const TLD_SUFFIXES = ["com-br", "com", "net", "org", "io", "app", "dev", "co"];

/**
 * Site que um item do pool representa, quando há um.
 *
 * Mesma filosofia de `sectionOf`: quem nomeia o master já classifica. Um clipe chamado
 * `company-web-app-passoamerica.com.mp4` vira automaticamente um link para
 * `https://passoamerica.com` — nenhuma lista para manter ao entregar um site novo.
 *
 * O pipeline (`slugify` em scripts/prepare-media.mjs) troca os pontos por hífen, então o
 * domínio chega aqui como `...-passoamerica-com` e precisa ser remontado: o último token
 * antes do sufixo é o nome do domínio, e o sufixo vira a extensão. Sem sufixo conhecido
 * não há link — é assim que `company-web-app-nexora-conceitual` (peça conceitual, não um
 * site no ar) e `company-web-app-mobile` ficam de fora sem precisar de exceção.
 */
export function siteOf(item: PoolItem): { host: string; href: string } | undefined {
  const base = fileName(item).replace(/\.[a-z0-9]+$/, "");
  const suffix = TLD_SUFFIXES.find((tld) => base.endsWith(`-${tld}`));
  if (!suffix) return undefined;

  const label = base.slice(0, -(suffix.length + 1)).split("-").pop();
  if (!label) return undefined;

  const host = `${label}.${suffix.replace(/-/g, ".")}`;
  return { host, href: `https://${host}` };
}

/** Move os itens listados para o começo, preservando o resto na ordem original. */
function promote(pool: readonly PoolItem[], featured: readonly string[]) {
  const rank = new Map(featured.map((name, index) => [name, index]));
  return pool
    .filter((item) => !(fileName(item) in BLOCKED))
    .sort((a, b) => {
      const ra = rank.get(fileName(a)) ?? Number.MAX_SAFE_INTEGER;
      const rb = rank.get(fileName(b)) ?? Number.MAX_SAFE_INTEGER;
      return ra - rb;
    });
}

const EVENTS_FEATURED = [
  "events-wall-led-create-show-experience.webp",
  "events-stage-lighting.webp",
  // Vídeo dentro dos 5 primeiros: quem chega já vê a camada da frente viva (§9).
  "events-cople-flipingcamp.mp4",
  "events-dj-mixing.webp",
  "events-photo-couple-cross-1.webp",
  "events-led-touring-festivals.webp",
  "events-photographer-wedding.webp",
];

const COMPANY_FEATURED = [
  "company-foto-produto-profissional-studio.webp",
  "company-maquiagem.webp",
  // Idem — o card Company abre já mostrando um trabalho em movimento (aqui, um site
  // real entregue pela FSB, que ainda leva o link clicável em /company → web).
  "company-web-app-passoamerica-com.mp4",
  // Os outros sites reais entregues pela FSB. Ficam no topo porque a seção `web` tem 21
  // itens e o arco só mostra os 9 primeiros — sem isto, justamente os trabalhos que
  // levam link clicável ficariam de fora da galeria.
  "company-web-app-kaminskilaw-com.mp4",
  "company-web-app-paraisotropicalbr222-com-br.mp4",
  "company-web-app-nexora-conceitual.mp4",
  "company-estudio-fotografico-modelo.webp",
  "company-food-image.webp",
  "company-gravacao-curso-3.webp",
  "company-gravacao-curso-1.webp",
];

export const pools: Record<Universe, readonly PoolItem[]> = {
  events: promote(eventsPool, EVENTS_FEATURED),
  company: promote(companyPool, COMPANY_FEATURED),
};

/** Quantas imagens de cada pool entram no HTML já com prioridade alta. */
export const PRELOAD_COUNT = 4;

/** Camadas de profundidade simultâneas atrás do card (§9). */
export const LAYER_COUNT = 5;

/**
 * Itens de uma seção de um universo, na ordem de curadoria (`FEATURED` primeiro).
 * Usado pelas páginas /company e /events — cada seção da barra lateral mostra só o que
 * pertence a ela.
 */
export function poolBySection<U extends Universe>(
  universe: U,
  section: SectionOf<U>,
): readonly PoolItem[] {
  return pools[universe].filter((item) => sectionOf(universe, item) === section);
}

export type { PoolItem };
