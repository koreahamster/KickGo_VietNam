import { TEAM_SHELL_EN } from "@/core/i18n/en";
import { TEAM_SHELL_KO } from "@/core/i18n/ko";
import { TEAM_SHELL_VI } from "@/core/i18n/vi";
import type { SupportedLanguage } from "@/types/profile.types";

export type TeamShellCopy = {
  [K in keyof typeof TEAM_SHELL_EN]: string;
};

const COPY: Record<SupportedLanguage, TeamShellCopy> = {
  ko: TEAM_SHELL_KO,
  vi: TEAM_SHELL_VI,
  en: TEAM_SHELL_EN,
};

export function getTeamShellCopy(language: SupportedLanguage): TeamShellCopy {
  return COPY[language] ?? COPY.en;
}