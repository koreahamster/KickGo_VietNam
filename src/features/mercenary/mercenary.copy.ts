import { MERCENARY_EN } from "@/core/i18n/en";
import { MERCENARY_KO } from "@/core/i18n/ko";
import { MERCENARY_VI } from "@/core/i18n/vi";
import type { SupportedLanguage } from "@/types/profile.types";

export type MercenaryCopy = {
  [K in keyof typeof MERCENARY_EN]: (typeof MERCENARY_EN)[K];
};

const COPY: Record<SupportedLanguage, MercenaryCopy> = {
  ko: MERCENARY_KO,
  vi: MERCENARY_VI,
  en: MERCENARY_EN,
};

export function getMercenaryCopy(language: SupportedLanguage): MercenaryCopy {
  return COPY[language];
}