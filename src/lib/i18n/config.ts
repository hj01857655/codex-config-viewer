import { enDictionary } from "@/lib/i18n/dictionaries/en";
import { zhCnDictionary } from "@/lib/i18n/dictionaries/zh-CN";
import type { DictionaryShape } from "@/lib/i18n/types";

export const LOCALES = ["en", "zh-CN"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "zh-CN";

export type Dictionary = DictionaryShape;

const dictionaries: Record<Locale, Dictionary> = {
  en: enDictionary,
  "zh-CN": zhCnDictionary,
};

export function isLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function detectLocaleFromAcceptLanguage(value: string | null): Locale {
  if (!value) {
    return DEFAULT_LOCALE;
  }

  const lowered = value.toLowerCase();

  if (lowered.includes("zh")) {
    return "zh-CN";
  }

  return "en";
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === "en" ? "zh-CN" : "en";
}
