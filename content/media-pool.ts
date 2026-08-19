import {
  companyPool,
  eventsPool,
  type PoolImage,
} from "./media-pool.generated";

/**
 * Curadoria sobre o inventário gerado.
 *
 * media-pool.generated.ts é o que existe em disco; aqui decidimos a ORDEM.
 * Isso importa: as primeiras imagens de cada pool são as pré-carregadas e as primeiras
 * a aparecer no hover, então as mais fortes vêm na frente.
 */

export type Universe = "events" | "company";

/**
 * Imagens que NÃO podem entrar no site, com o motivo.
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
};

const fileName = (image: PoolImage) => image.src.split("/").pop() ?? image.src;

/** Move as imagens listadas para o começo, preservando o resto na ordem original. */
function promote(pool: readonly PoolImage[], featured: readonly string[]) {
  const rank = new Map(featured.map((name, index) => [name, index]));
  return pool
    .filter((image) => !(fileName(image) in BLOCKED))
    .sort((a, b) => {
      const ra = rank.get(fileName(a)) ?? Number.MAX_SAFE_INTEGER;
      const rb = rank.get(fileName(b)) ?? Number.MAX_SAFE_INTEGER;
      return ra - rb;
    });
}

const EVENTS_FEATURED = [
  "events-wall-led-create-show-experience.webp",
  "events-stage-lighting.webp",
  "events-dj-mixing.webp",
  "events-photo-couple-cross-1.webp",
  "events-led-touring-festivals.webp",
  "events-photographer-wedding.webp",
];

const COMPANY_FEATURED = [
  "company-foto-produto-profissional-studio.webp",
  "company-maquiagem.webp",
  "company-estudio-fotografico-modelo.webp",
  "company-food-image.webp",
  "company-gravacao-curso-3.webp",
  "company-gravacao-curso-1.webp",
];

export const pools: Record<Universe, readonly PoolImage[]> = {
  events: promote(eventsPool, EVENTS_FEATURED),
  company: promote(companyPool, COMPANY_FEATURED),
};

/** Quantas imagens de cada pool entram no HTML já com prioridade alta. */
export const PRELOAD_COUNT = 4;

/** Camadas de profundidade simultâneas atrás do card (§9). */
export const LAYER_COUNT = 6;

export type { PoolImage };
