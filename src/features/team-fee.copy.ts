import { TEAM_FEE_EN } from "@/core/i18n/en";
import { TEAM_FEE_KO } from "@/core/i18n/ko";
import { TEAM_FEE_VI } from "@/core/i18n/vi";
import type { SupportedLanguage } from "@/types/profile.types";

export type TeamFeeCopy = {
  [K in keyof typeof TEAM_FEE_EN]: string;
};

const COPY: Record<SupportedLanguage, TeamFeeCopy> = {
  ko: TEAM_FEE_KO,
  vi: TEAM_FEE_VI,
  en: TEAM_FEE_EN,
};

export function getTeamFeeCopy(language: SupportedLanguage): TeamFeeCopy {
  return COPY[language] ?? COPY.en;
}