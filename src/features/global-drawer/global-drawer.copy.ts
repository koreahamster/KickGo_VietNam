import { GLOBAL_DRAWER_EN } from "@/core/i18n/en";
import { GLOBAL_DRAWER_KO } from "@/core/i18n/ko";
import { GLOBAL_DRAWER_VI } from "@/core/i18n/vi";
import type { SupportedLanguage } from "@/types/profile.types";

export type GlobalDrawerCopy = {
  [K in keyof typeof GLOBAL_DRAWER_EN]: string;
};

const COPY: Record<SupportedLanguage, GlobalDrawerCopy> = {
  ko: GLOBAL_DRAWER_KO,
  vi: GLOBAL_DRAWER_VI,
  en: GLOBAL_DRAWER_EN,
};

export function getGlobalDrawerCopy(language: SupportedLanguage): GlobalDrawerCopy {
  return COPY[language] ?? COPY.en;
}
