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

  /** Usado em metadata/OpenGraph e no sitemap. Domínio próprio, DNS na HostGator
   *  apontando pro GitHub Pages (ver README → Deploy). */
  url: "https://portalfsb.com",

  contact: {
    email: "contact@portalfsb.com",
    phoneLabel: "+1 (407) 686-8511",
    phoneHref: "tel:+14076868511",
    /** Mesmo número do telefone principal — o contato é encaminhado pelo WhatsApp. */
    whatsappHref: "https://wa.me/14076868511",
    location: "2295 S Hiawassee Rd, Ste 313, Orlando, FL 32835",
    locationHref:
      "https://www.google.com/maps/search/2295+S+Hiawassee+Rd,+Ste+313,+Orlando+FL+32835,+Estados+Unidos/@28.5178,-81.4819,17z?hl=pt-BR",
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

/** Filme institucional (§16), exibido em `FilmSection` — gerado por
 *  scripts/prepare-media.mjs a partir de film/fsb-institutional.mp4. */
export const filmMedia = {
  poster: "/media/film/fsb-institutional-poster.webp",
  webm: "/media/film/fsb-institutional.webm",
  mp4: "/media/film/fsb-institutional.mp4",
} as const;

export const logos = {
  /** Versão clara — para fundos escuros, que é o caso em todo o site. */
  light: "/media/logo/fsb-principal-claro.webp",
  lightRetina: "/media/logo/fsb-principal-claro@2x.webp",
  /** Versão escura — para fundos claros (impressos, parceiros). Não usada no site hoje. */
  dark: "/media/logo/fsb-principal-escuro.webp",
  darkRetina: "/media/logo/fsb-principal-escuro@2x.webp",
  /** Selo circular com anel de texto, já corrigido (sem o "STORYTELLIHC" antigo). */
  seal: "/media/logo/fsb-reduzida-escuro.webp",
  sealRetina: "/media/logo/fsb-reduzida-escuro@2x.webp",
  /** Só o ícone do obturador, sem texto — para usos pequenos (favicon, spinner). */
  icon: "/media/logo/fsb-icone.webp",
  iconRetina: "/media/logo/fsb-icone@2x.webp",
  /** Mesmo ícone, vetorizado (ver scripts/README de mídia) — usado no favicon
   *  (`app/icon.svg`). Cores batidas com o master; sem texto, então nada de trace
   *  de letras — só as 7 lâminas + triângulo, que são formas chapadas. */
  iconSvg: "/media/logo/fsb-icone.svg",
  /** Ícone dentro do anel metálico, sem texto. */
  iconRing: "/media/logo/fsb-icone-anel.webp",
  iconRingRetina: "/media/logo/fsb-icone-anel@2x.webp",
} as const;
