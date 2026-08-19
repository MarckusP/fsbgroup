import { en } from "@/content/dictionaries/en";
import { pt } from "@/content/dictionaries/pt";
import type { Dictionary, Locale } from "@/content/dictionaries/types";

const dictionaries: Record<Locale, Dictionary> = { pt, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Códigos BCP-47 completos, para o atributo lang e o hreflang. */
export const HTML_LANG: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
};

export { LOCALES, DEFAULT_LOCALE, isLocale } from "@/content/dictionaries/types";
export type { Dictionary, Locale };
