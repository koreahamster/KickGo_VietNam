import { TEAM_RECRUITMENT_EN } from "@/core/i18n/en";
import { TEAM_RECRUITMENT_KO } from "@/core/i18n/ko";
import { TEAM_RECRUITMENT_VI } from "@/core/i18n/vi";
import type { SupportedLanguage } from "@/types/profile.types";

type TeamRecruitmentCopy = {
  [K in keyof typeof TEAM_RECRUITMENT_EN]: string;
};

const COPY: Record<SupportedLanguage, TeamRecruitmentCopy> = {
  ko: TEAM_RECRUITMENT_KO,
  vi: TEAM_RECRUITMENT_VI,
  en: TEAM_RECRUITMENT_EN,
};

export type { TeamRecruitmentCopy };

export function getTeamRecruitmentCopy(language: SupportedLanguage): TeamRecruitmentCopy {
  return COPY[language] ?? COPY.en;
}