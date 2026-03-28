import { TEAM_ANNOUNCEMENTS_EN } from "@/core/i18n/en";
import { TEAM_ANNOUNCEMENTS_KO } from "@/core/i18n/ko";
import { TEAM_ANNOUNCEMENTS_VI } from "@/core/i18n/vi";
import type { SupportedLanguage } from "@/types/profile.types";

type TeamAnnouncementsCopy = {
  sectionTitle: string;
  allView: string;
  writeAction: string;
  emptyTitle: string;
  emptyBody: string;
  writeTitle: string;
  writeButton: string;
  titleLabel: string;
  bodyLabel: string;
  titlePlaceholder: string;
  bodyPlaceholder: string;
  createSuccess: string;
  createErrorFallback: string;
  detailFallbackAuthor: string;
  latestLabel: string;
  latestEmpty: string;
  loading: string;
  createdAtLabel: string;
  titleRequired: string;
  titleTooLong: string;
  bodyRequired: string;
  bodyTooLong: string;
  pinnedBadge: string;
  pinnedDetailBadge: string;
  pinOnLabel: string;
  pinOffLabel: string;
  pinTogglePinnedSuccess: string;
  pinToggleUnpinnedSuccess: string;
  pinToggleErrorFallback: string;
  numberPrefix: string;
  bylineSeparator: string;
  pinSwitchLabel: string;
  pinSwitchHint: string;
};

const COPY: Record<SupportedLanguage, TeamAnnouncementsCopy> = {
  ko: TEAM_ANNOUNCEMENTS_KO,
  vi: TEAM_ANNOUNCEMENTS_VI,
  en: TEAM_ANNOUNCEMENTS_EN,
};

export type { TeamAnnouncementsCopy };

export function getTeamAnnouncementsCopy(language: SupportedLanguage): TeamAnnouncementsCopy {
  return COPY[language] ?? COPY.en;
}