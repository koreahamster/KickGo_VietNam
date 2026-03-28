import { PLAYER_PROFILE_EN } from "@/core/i18n/en";
import { PLAYER_PROFILE_KO } from "@/core/i18n/ko";
import { PLAYER_PROFILE_VI } from "@/core/i18n/vi";
import { PROFILE_ROLE_LABELS } from "@/components/profile/profileShared";
import type { PlayerPosition, PlayerProfileRecord, SupportedLanguage } from "@/types/profile.types";
import type { RadarMetric } from "@/shared/components/ProfileRadarChart";

export const PLAYER_POSITION_VALUES: PlayerPosition[] = [
  "GK",
  "CB",
  "LB",
  "RB",
  "CDM",
  "CM",
  "CAM",
  "LM",
  "RM",
  "LW",
  "RW",
  "CF",
  "ST",
];

type PlayerProfileCopy = {
  title: string;
  countryFallback: string;
  amateurBadge: string;
  profileIncompleteTitle: string;
  profileIncompleteBody: string;
  continueOnboarding: string;
  overviewMatches: string;
  overviewGoals: string;
  overviewAssists: string;
  overviewMvp: string;
  teamSectionTitle: string;
  teamEmptyTitle: string;
  teamEmptyBody: string;
  findTeam: string;
  createTeam: string;
  levelTitle: string;
  levelEdit: string;
  preferredPositionsTitle: string;
  preferredPositionsDescription: string;
  firstChoice: string;
  secondChoice: string;
  thirdChoice: string;
  choosePosition: string;
  noPosition: string;
  savePositions: string;
  positionRequired: string;
  positionDuplicate: string;
  positionsSaved: string;
  positionsEmpty: string;
  statsEditorTitle: string;
  statsEditorBody: string;
  saveStats: string;
  statsSaved: string;
  save: string;
  cancel: string;
  saving: string;
  staminaLabel: string;
  dribbleLabel: string;
  shootingLabel: string;
  passingLabel: string;
  defenseLabel: string;
  speedLabel: string;
  tierLabels: readonly string[];
  pointsSuffix: string;
  ageBands: Record<"teen" | "twenties" | "thirties" | "forties" | "fifties" | "sixtyPlus", string>;
  countryLabels: Record<string, string>;
  positionLabels: Record<PlayerPosition, string>;
};

const COPY: Record<SupportedLanguage, PlayerProfileCopy> = {
  ko: PLAYER_PROFILE_KO,
  vi: PLAYER_PROFILE_VI,
  en: PLAYER_PROFILE_EN,
};

export type PlayerPositionOption = {
  value: PlayerPosition;
  code: PlayerPosition;
  label: string;
};

export function getPlayerProfileCopy(language: SupportedLanguage): PlayerProfileCopy {
  return COPY[language];
}

export function getPositionOptions(language: SupportedLanguage): PlayerPositionOption[] {
  const copy = getPlayerProfileCopy(language);

  return PLAYER_POSITION_VALUES.map((value) => ({
    value,
    code: value,
    label: copy.positionLabels[value],
  }));
}

export function getCountryFlag(code: string | null | undefined): string {
  if (!code) {
    return "?";
  }

  const normalized = code.trim().toUpperCase();

  if (normalized.length === 2) {
    return normalized
      .split("")
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
      .join("");
  }

  return "?";
}

export function getCountryLabel(
  language: SupportedLanguage,
  countryCode: string | null | undefined,
  fallback: string,
): string {
  if (!countryCode) {
    return fallback;
  }

  const copy = getPlayerProfileCopy(language);
  return copy.countryLabels[countryCode.trim().toUpperCase()] ?? fallback;
}

export function getAgeBandLabel(
  language: SupportedLanguage,
  birthYear: number | null | undefined,
  fallbackRoleLabel: string,
): string {
  if (!birthYear) {
    return fallbackRoleLabel;
  }

  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear + 1;
  const copy = getPlayerProfileCopy(language);

  if (age < 20) return copy.ageBands.teen;
  if (age < 30) return copy.ageBands.twenties;
  if (age < 40) return copy.ageBands.thirties;
  if (age < 50) return copy.ageBands.forties;
  if (age < 60) return copy.ageBands.fifties;
  return copy.ageBands.sixtyPlus;
}

export function getStatusBadgeLabel(language: SupportedLanguage, position: PlayerPosition | null | undefined): string {
  const copy = getPlayerProfileCopy(language);
  return position ? copy.positionLabels[position] : copy.amateurBadge;
}

export function getRoleBadgeLabel(language: SupportedLanguage, role: string): string {
  return PROFILE_ROLE_LABELS[language][role] ?? role;
}

export function getPrimaryRoleLabel(language: SupportedLanguage, accountTypes: string[]): string {
  const primaryRole = accountTypes[0] ?? "player";
  return getRoleBadgeLabel(language, primaryRole);
}

export function getTierDisplay(
  language: SupportedLanguage,
  tierValue: number | null | undefined,
  points: number | null | undefined,
): string {
  const copy = getPlayerProfileCopy(language);
  const tierIndex = Math.max(0, Math.min(copy.tierLabels.length - 1, Math.round(tierValue ?? 0)));
  const pointsValue = Math.max(0, Math.round(points ?? 0));
  return `${copy.tierLabels[tierIndex]} ${pointsValue}${copy.pointsSuffix}`;
}

export function buildRadarMetrics(
  language: SupportedLanguage,
  playerProfile: PlayerProfileRecord | null,
  override?: Partial<Record<StatKey, number>>,
): RadarMetric[] {
  const copy = getPlayerProfileCopy(language);

  return [
    { key: "stamina", label: copy.staminaLabel, value: override?.stamina ?? playerProfile?.stat_stamina ?? 50 },
    { key: "dribble", label: copy.dribbleLabel, value: override?.dribble ?? playerProfile?.stat_dribble ?? 50 },
    { key: "shooting", label: copy.shootingLabel, value: override?.shooting ?? playerProfile?.stat_shooting ?? 50 },
    { key: "speed", label: copy.speedLabel, value: override?.speed ?? playerProfile?.stat_speed ?? 50 },
    { key: "defense", label: copy.defenseLabel, value: override?.defense ?? playerProfile?.stat_defense ?? 50 },
    { key: "passing", label: copy.passingLabel, value: override?.passing ?? playerProfile?.stat_passing ?? 50 },
  ];
}

type StatKey = "stamina" | "dribble" | "shooting" | "passing" | "defense" | "speed";