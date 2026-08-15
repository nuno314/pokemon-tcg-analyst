import { en } from "./en";
import { es } from "./es";
import { ja } from "./ja";
import { ptBR } from "./pt-BR";
import { vi } from "./vi";
import type { Dictionary } from "./types";

export type Locale = "en" | "pt-BR" | "es" | "ja" | "vi";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "ptcgl-locale";

export const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "es", label: "Español" },
  { value: "ja", label: "日本語" },
  { value: "vi", label: "Tiếng Việt" },
];

const dictionaries: Record<Locale, Dictionary> = {
  en,
  "pt-BR": ptBR,
  es,
  ja,
  vi,
};

export function parseLocale(raw: string | null | undefined): Locale {
  if (raw && raw in dictionaries) return raw as Locale;
  return DEFAULT_LOCALE;
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en;
}

export function localeToHtmlLang(locale: Locale): string {
  return locale;
}

export function localeToDateLocale(locale: Locale): string {
  switch (locale) {
    case "vi":
      return "vi-VN";
    case "pt-BR":
      return "pt-BR";
    case "es":
      return "es-ES";
    case "ja":
      return "ja-JP";
    default:
      return "en-US";
  }
}

export type { Dictionary } from "./types";
export { PLAYER_ASSESSMENT_MIN_MATCHES } from "./constants";
