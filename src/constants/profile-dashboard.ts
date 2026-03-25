import type { SupportedLanguage } from "@/types/profile.types";
import type { TeamMemberRole } from "@/types/team.types";

type LocalizedText = {
  title: string;
  editProfile: string;
  unregistered: string;
  countryFallback: string;
  levelTitle: string;
  teamTitle: string;
  teamFind: string;
  teamCreate: string;
  noTeamTitle: string;
  noTeamBody: string;
  competitionLabel: string;
  statMatches: string;
  statGoals: string;
  statAssists: string;
  statMvp: string;
  matchCategory: string;
  noProfileTitle: string;
  noProfileBody: string;
  continueOnboarding: string;
  uploadAvatar: string;
  scoreInputSoon: string;
  levelInputSoon: string;
  roleOwner: string;
  roleManager: string;
  roleCaptain: string;
  rolePlayer: string;
};

export type ProfileDashboardCopy = LocalizedText;

const COPY: Record<SupportedLanguage, ProfileDashboardCopy> = {
  ko: {
    title: "내 프로필",
    editProfile: "프로필 수정",
    unregistered: "비선출",
    countryFallback: "대한민국",
    levelTitle: "나의 축구 레벨",
    teamTitle: "소속 팀",
    teamFind: "팀 찾기",
    teamCreate: "팀 만들기",
    noTeamTitle: "아직 소속된 팀이 없어요",
    noTeamBody: "팀을 만들거나 가입해서 팀 활동을 시작해 보세요.",
    competitionLabel: "대항전",
    statMatches: "경기",
    statGoals: "득점",
    statAssists: "도움",
    statMvp: "MVP",
    matchCategory: "대항전",
    noProfileTitle: "프로필이 아직 준비되지 않았어요",
    noProfileBody: "공통 프로필을 먼저 완성해야 프로필 화면을 볼 수 있습니다.",
    continueOnboarding: "온보딩 계속",
    uploadAvatar: "사진 변경",
    scoreInputSoon: "능력치 입력은 추후 지원됩니다.",
    levelInputSoon: "티어와 점수는 서버 집계 기반으로 제공됩니다.",
    roleOwner: "owner",
    roleManager: "manager",
    roleCaptain: "captain",
    rolePlayer: "player"
  },
  vi: {
    title: "Ho so cua toi",
    editProfile: "Sua ho so",
    unregistered: "Chua qua dao tao",
    countryFallback: "Viet Nam",
    levelTitle: "Cap do bong da cua toi",
    teamTitle: "Doi bong",
    teamFind: "Tim doi",
    teamCreate: "Tao doi",
    noTeamTitle: "Ban chua co doi bong",
    noTeamBody: "Hay tao doi hoac tham gia doi de bat dau hoat dong.",
    competitionLabel: "Doi khang",
    statMatches: "Tran",
    statGoals: "Ban thang",
    statAssists: "Kien tao",
    statMvp: "MVP",
    matchCategory: "Doi khang",
    noProfileTitle: "Ho so chua san sang",
    noProfileBody: "Ban can hoan thanh ho so co ban truoc.",
    continueOnboarding: "Tiep tuc onboarding",
    uploadAvatar: "Doi anh",
    scoreInputSoon: "Tinh nang nhap chi so se co sau.",
    levelInputSoon: "Cap do va diem duoc tinh tu he thong.",
    roleOwner: "owner",
    roleManager: "manager",
    roleCaptain: "captain",
    rolePlayer: "player"
  },
  en: {
    title: "My Profile",
    editProfile: "Edit profile",
    unregistered: "Amateur",
    countryFallback: "South Korea",
    levelTitle: "My Football Level",
    teamTitle: "Teams",
    teamFind: "Find team",
    teamCreate: "Create team",
    noTeamTitle: "You are not in a team yet",
    noTeamBody: "Create a team or join one to start playing together.",
    competitionLabel: "Competitive",
    statMatches: "Matches",
    statGoals: "Goals",
    statAssists: "Assists",
    statMvp: "MVP",
    matchCategory: "Competitive",
    noProfileTitle: "Profile is not ready yet",
    noProfileBody: "Complete your common profile before using this screen.",
    continueOnboarding: "Continue onboarding",
    uploadAvatar: "Change photo",
    scoreInputSoon: "Manual stat input will be added later.",
    levelInputSoon: "Tier and score are managed by the server.",
    roleOwner: "owner",
    roleManager: "manager",
    roleCaptain: "captain",
    rolePlayer: "player"
  }
};

const COUNTRY_NAMES: Record<string, Record<SupportedLanguage, string>> = {
  KR: { ko: "대한민국", vi: "Han Quoc", en: "South Korea" },
  VN: { ko: "베트남", vi: "Viet Nam", en: "Vietnam" },
  US: { ko: "미국", vi: "My", en: "United States" },
  JP: { ko: "일본", vi: "Nhat Ban", en: "Japan" },
  TH: { ko: "태국", vi: "Thai Lan", en: "Thailand" }
};

const TIER_NAMES: Record<SupportedLanguage, string[]> = {
  ko: ["브론즈", "실버", "골드", "플래티넘", "세미프로", "프로"],
  vi: ["Dong", "Bac", "Vang", "Bach kim", "Ban chuyen", "Chuyen nghiep"],
  en: ["Bronze", "Silver", "Gold", "Platinum", "Semi-Pro", "Pro"]
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getProfileDashboardCopy(language: SupportedLanguage): ProfileDashboardCopy {
  return COPY[language];
}

export function getCountryFlag(countryCode: string | null | undefined): string {
  const code = (countryCode ?? "").trim().toUpperCase();

  if (code.length !== 2) {
    return "🌍";
  }

  return Array.from(code)
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join("");
}

export function getCountryLabel(
  language: SupportedLanguage,
  countryCode: string | null | undefined,
  fallback: string,
): string {
  const code = (countryCode ?? "").trim().toUpperCase();
  return COUNTRY_NAMES[code]?.[language] ?? fallback;
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
  const band = clamp(Math.floor(age / 10) * 10, 10, 60);

  if (language === "ko") {
    return `${band}대 ${fallbackRoleLabel}`;
  }

  if (language === "vi") {
    return `${band}+ ${fallbackRoleLabel}`;
  }

  return `${band}s ${fallbackRoleLabel}`;
}

export function getStatusBadgeLabel(
  language: SupportedLanguage,
  preferredPosition: string | null | undefined,
): string {
  if (preferredPosition && preferredPosition.trim()) {
    return preferredPosition.trim().toUpperCase();
  }

  return COPY[language].unregistered;
}

export function getRoleBadgeLabel(language: SupportedLanguage, role: TeamMemberRole): string {
  const copy = COPY[language];

  if (role === "owner") {
    return copy.roleOwner;
  }

  if (role === "manager") {
    return copy.roleManager;
  }

  if (role === "captain") {
    return copy.roleCaptain;
  }

  return copy.rolePlayer;
}

export function getTierDisplay(language: SupportedLanguage, skillTier: number, reputationScore: number) {
  const tiers = TIER_NAMES[language];
  const safeTier = clamp(Math.round(skillTier), 0, tiers.length - 1);
  const score = clamp(Math.round(reputationScore), 0, 100);

  return {
    label: tiers[safeTier] ?? tiers[0],
    score,
  };
}

export function buildRadarValues(reputationScore: number) {
  const base = clamp(Math.round(reputationScore), 20, 100);

  return {
    stamina: clamp(base + 4, 0, 100),
    dribble: clamp(base - 2, 0, 100),
    shooting: clamp(base - 5, 0, 100),
    speed: clamp(base + 1, 0, 100),
    defense: clamp(base - 3, 0, 100),
    pass: clamp(base, 0, 100),
  };
}