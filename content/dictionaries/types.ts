/**
 * Forma única de todo o texto do site.
 *
 * pt.ts e en.ts são tipados contra `Dictionary`, então uma chave faltando ou sobrando
 * quebra o build — as traduções não saem de sincronia em silêncio.
 */

import type { CompanySection, EventsSection } from "@/content/media-pool";

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

/** Copy de uma seção dentro de /company ou /events (a "página" que a barra lateral abre). */
export type SectionCopy = {
  /** Rótulo curto para a barra lateral — o `eyebrow` completo é longo demais pra coluna estreita. */
  readonly navLabel: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly cta: string;
};

/** Copy de um universo inteiro (/company ou /events): cabeçalho + uma `SectionCopy` por seção. */
export type UniverseCopy<Section extends string> = {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  /** Rótulo do campo "tipo" do formulário de contato — "Tipo de evento" em Events,
   *  "Tipo de projeto" em Company. */
  readonly formTypeLabel: string;
  readonly sections: Record<Section, SectionCopy>;
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
    readonly back: string;
  };
  readonly hero: {
    /** Palavras que piscam sobre o vídeo (§2). */
    readonly words: readonly string[];
    /** Frase-assinatura da marca (§28), em duas linhas. */
    readonly signature: readonly [string, string];
    readonly scrollHint: string;
    /** Abertura em tela cheia (§3): o vídeo toca sozinho antes da página montar. */
    readonly intro: {
      readonly skip: string;
      readonly loading: string;
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
  /** Conteúdo real de /events — barra lateral + colunas de cada seção. */
  readonly events: UniverseCopy<EventsSection>;
  /** Conteúdo real de /company — barra lateral + colunas de cada seção. */
  readonly company: UniverseCopy<CompanySection>;
  /** Formulário de contato (encaminha pro WhatsApp) em /company e /events. */
  readonly form: {
    readonly eyebrow: string;
    readonly title: string;
    readonly name: string;
    readonly namePlaceholder: string;
    /** Único outro campo obrigatório, junto com o nome. */
    readonly date: string;
    readonly email: string;
    readonly emailPlaceholder: string;
    readonly details: string;
    readonly detailsPlaceholder: string;
    readonly cta: string;
  };
};
