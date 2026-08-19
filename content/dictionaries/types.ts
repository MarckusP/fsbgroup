/**
 * Forma única de todo o texto do site.
 *
 * pt.ts e en.ts são tipados contra `Dictionary`, então uma chave faltando ou sobrando
 * quebra o build — as traduções não saem de sincronia em silêncio.
 */

export const LOCALES = ["pt", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Um par "escopo + afirmação" — o escopo recebe destaque tipográfico. */
export type Pillar = {
  readonly scope: string;
  readonly text: string;
};

export type PathCopy = {
  readonly name: string;
  readonly tagline: string;
  readonly cta: string;
};

export type Dictionary = {
  readonly meta: {
    readonly title: string;
    readonly description: string;
  };
  readonly nav: {
    readonly skipToContent: string;
    readonly home: string;
    readonly localeLabel: string;
  };
  readonly hero: {
    /** Palavras que piscam sobre o vídeo (§2). */
    readonly words: readonly string[];
    /** Frase-assinatura da marca (§28), em duas linhas. */
    readonly signature: readonly [string, string];
    readonly scrollHint: string;
    readonly sound: {
      readonly enable: string;
      readonly disable: string;
    };
  };
  readonly paths: {
    readonly eyebrow: string;
    readonly hint: string;
    readonly events: PathCopy;
    readonly company: PathCopy;
  };
  readonly film: {
    readonly eyebrow: string;
    readonly title: string;
    readonly play: string;
  };
  readonly vision: {
    readonly eyebrow: string;
    readonly title: string;
    readonly lead: string;
    readonly pillars: readonly [Pillar, Pillar, Pillar];
    readonly manifesto: readonly string[];
    readonly closing: readonly [string, string];
  };
  readonly finalPaths: {
    readonly title: string;
    readonly events: PathCopy;
    readonly company: PathCopy;
  };
  readonly footer: {
    readonly tagline: string;
    readonly contact: string;
    readonly follow: string;
    readonly rights: string;
    readonly logoAlt: string;
  };
  /** Telas provisórias de /events e /company. */
  readonly soon: {
    readonly badge: string;
    readonly back: string;
    readonly events: { readonly title: string; readonly text: string };
    readonly company: { readonly title: string; readonly text: string };
  };
};
