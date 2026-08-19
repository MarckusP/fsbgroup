/**
 * Dados institucionais da FSB.
 *
 * ⚠️ TODOS os valores marcados com "TODO:" são placeholders. Trocar aqui — este é o
 * único lugar onde contato e redes aparecem. NÃO PUBLICAR o site antes de preencher.
 */

export type SocialLink = {
  readonly id: "instagram" | "youtube" | "linkedin" | "tiktok";
  readonly label: string;
  readonly href: string;
};

export const site = {
  name: "FSB Production",
  shortName: "FSB",
  foundedYear: 2023,

  /** Usado em metadata/OpenGraph e no sitemap. */
  url: "https://fsbproduction.com.br", // TODO: domínio definitivo

  contact: {
    email: "contato@fsbproduction.com.br", // TODO
    phoneLabel: "+55 (00) 00000-0000", // TODO
    phoneHref: "tel:+550000000000", // TODO
    whatsappHref: "https://wa.me/550000000000", // TODO
    location: "Brasil", // TODO: cidade / estado
  },

  socials: [
    { id: "instagram", label: "Instagram", href: "https://instagram.com/fsbproduction" }, // TODO
    { id: "youtube", label: "YouTube", href: "https://youtube.com/@fsbproduction" }, // TODO
    { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com/company/fsbproduction" }, // TODO
    { id: "tiktok", label: "TikTok", href: "https://tiktok.com/@fsbproduction" }, // TODO
  ] satisfies readonly SocialLink[],
} as const;

/** Fontes do hero, geradas por scripts/prepare-media.mjs. */
export const heroMedia = {
  poster: "/media/hero/fsb-hero-poster.webp",
  posterMobile: "/media/hero/fsb-hero-mobile-poster.webp",
  webm: "/media/hero/fsb-hero.webm",
  mp4: "/media/hero/fsb-hero.mp4",
  mp4Mobile: "/media/hero/fsb-hero-mobile.mp4",
} as const;

export const logos = {
  /** Versão clara — para fundos escuros, que é o caso em todo o site. */
  light: "/media/logo/fsb-principal-claro.webp",
  lightRetina: "/media/logo/fsb-principal-claro@2x.webp",
  /** Selo circular. Ver nota de risco: o master traz "STORYTELLIHC" no anel externo,
   *  ilegível em tamanho pequeno — por isso só é usado decorativo/reduzido. */
  seal: "/media/logo/fsb-reduzida-claro.webp",
} as const;
