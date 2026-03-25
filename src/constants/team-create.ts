import type { SupportedLanguage, SupportedVisibility } from "@/types/profile.types";
import type {
  TeamAgeGroup,
  TeamAttackDirection,
  TeamDefenseStyle,
  TeamFormation,
  TeamGenderType,
  TeamMatchDay,
  TeamMatchTime,
  TeamSportType,
  TeamTacticStyle,
  TeamUniformColor,
} from "@/types/team.types";

type Option<T extends string> = {
  label: string;
  value: T;
};

type UniformColorOption = Option<TeamUniformColor> & {
  color: string;
};

export type TeamCreateCopy = {
  title: string;
  progressLabel: string;
  basicHeading: string;
  scheduleHeading: string;
  tacticsHeading: string;
  sportType: string;
  teamName: string;
  foundedDate: string;
  province: string;
  district: string;
  homeGround: string;
  genderType: string;
  ageGroups: string;
  uniformColors: string;
  next: string;
  register: string;
  back: string;
  matchSchedule: string;
  teamPhoto: string;
  uploadTeamPhoto: string;
  description: string;
  descriptionPlaceholder: string;
  hasMonthlyFee: string;
  monthlyFeeHelper: string;
  monthlyFeeUnit: string;
  monthlyFeeValidation: string;
  formationA: string;
  formationB: string;
  tacticStyle: string;
  attackDirection: string;
  defenseStyle: string;
  completeTitle: string;
  completeSubtitle: string;
  completeFeatures: string[];
  tipLabel: string;
  tipBody: string;
  shareInviteNow: string;
  maybeLater: string;
  uploadEmblem: string;
  fieldRequiredMark: string;
  activityGroundPlaceholder: string;
  searchGround: string;
  foundedDatePlaceholder: string;
  selectPlaceholder: string;
  feePlaceholder: string;
  imageUploadFailed: string;
  inviteShareFailed: string;
  stepGuard: string;
  emblemUploadHint: string;
  uniformColorHint: string;
  scheduleHint: string;
  photoHint: string;
  completeShareMessage: string;
};

const COPY: Record<SupportedLanguage, TeamCreateCopy> = {
  ko: {
    title: "팀 등록",
    progressLabel: "단계",
    basicHeading: "클럽의 기본정보를 입력해주세요",
    scheduleHeading: "주경기 일정과 팀 소개를 입력해주세요",
    tacticsHeading: "클럽의 전술 성향을 입력해주세요",
    sportType: "종목 선택",
    teamName: "클럽 이름",
    foundedDate: "창단일 (8자리)",
    province: "도시",
    district: "지역",
    homeGround: "활동 구장",
    genderType: "팀 구성원",
    ageGroups: "연령대",
    uniformColors: "유니폼 (홈/어웨이/써드 순 최대 3개)",
    next: "다음",
    register: "등록하기",
    back: "뒤로가기",
    matchSchedule: "주경기 요일/시간",
    teamPhoto: "팀 대표 사진",
    uploadTeamPhoto: "클럽 사진 올리기",
    description: "클럽 소개",
    descriptionPlaceholder: "클럽을 소개해 주세요! 클럽 프로필에 보여지며, 다른 클럽과 선수들에게 유용한 정보가 될 수 있어요.",
    hasMonthlyFee: "회비가 있어요",
    monthlyFeeHelper: "매월 팀원에게 알림을 보내드려요",
    monthlyFeeUnit: "원",
    monthlyFeeValidation: "회비를 숫자로 입력해 주세요.",
    formationA: "플랜A 포메이션",
    formationB: "플랜B 포메이션",
    tacticStyle: "전술 성향",
    attackDirection: "공격 전개 방향",
    defenseStyle: "수비 방향",
    completeTitle: "팀 등록을 축하드려요!",
    completeSubtitle: "이제! 다양한 팀 관리를 경험할 수 있어요",
    completeFeatures: [
      "한 손으로 간편하게 라인업 설정",
      "실시간 경기 기록",
      "칭찬과 격려의 MVP 투표",
      "빠른 포지션 확인",
    ],
    tipLabel: "TIP",
    tipBody: "팀 초대코드로 팀원들에게 입단 심사 없이 팀에 초청할 수 있어요",
    shareInviteNow: "지금 바로 초대코드 공유",
    maybeLater: "다음에 할게요",
    uploadEmblem: "클럽 엠블럼 올리기",
    fieldRequiredMark: "*",
    activityGroundPlaceholder: "활동 구장",
    searchGround: "구장 검색",
    foundedDatePlaceholder: "YYYYMMDD",
    selectPlaceholder: "선택해 주세요",
    feePlaceholder: "회비",
    imageUploadFailed: "이미지를 업로드하지 못했습니다.",
    inviteShareFailed: "초대코드를 공유하지 못했습니다.",
    stepGuard: "이전 단계 입력을 먼저 완료해 주세요.",
    emblemUploadHint: "팀을 대표하는 엠블럼 이미지를 등록해 주세요.",
    uniformColorHint: "최대 3개까지 선택할 수 있어요.",
    scheduleHint: "요일과 시간대는 복수 선택할 수 있어요.",
    photoHint: "이 사진은 팀 프로필 상단에 노출됩니다.",
    completeShareMessage: "팀 초대코드를 공유해 팀원들을 빠르게 초대해 보세요.",
  },  vi: {
    title: "Dang ky clb",
    progressLabel: "Buoc",
    basicHeading: "Hay nhap thong tin co ban cua clb",
    scheduleHeading: "Hay nhap lich thi dau va gioi thieu doi bong",
    tacticsHeading: "Hay chon phong cach chien thuat cua clb",
    sportType: "Mon thi dau",
    teamName: "Ten clb",
    foundedDate: "Ngay thanh lap (8 so)",
    province: "Tinh/Thanh",
    district: "Quan/Huyen",
    homeGround: "San hoat dong",
    genderType: "Thanh phan doi",
    ageGroups: "Do tuoi",
    uniformColors: "Mau ao (toi da 3 mau)",
    next: "Tiep theo",
    register: "Dang ky",
    back: "Quay lai",
    matchSchedule: "Ngay/gio thi dau chinh",
    teamPhoto: "Anh dai dien doi",
    uploadTeamPhoto: "Tai anh clb",
    description: "Gioi thieu clb",
    descriptionPlaceholder: "Hay gioi thieu clb de hien thi tren ho so doi bong va giup nguoi khac hieu hon ve doi cua ban.",
    hasMonthlyFee: "Co hoi phi",
    monthlyFeeHelper: "Gui nhac hang thang cho thanh vien",
    monthlyFeeUnit: "VND",
    monthlyFeeValidation: "Hay nhap hoi phi bang so.",
    formationA: "So do A",
    formationB: "So do B",
    tacticStyle: "Phong cach chien thuat",
    attackDirection: "Huong tan cong",
    defenseStyle: "Phong ngu",
    completeTitle: "Chuc mung ban da tao clb!",
    completeSubtitle: "Bay gio ban co the trai nghiem quan ly doi bong day du",
    completeFeatures: [
      "Sap xep doi hinh bang mot tay",
      "Ghi lai tran dau theo thoi gian thuc",
      "Bau chon MVP khich le dong doi",
      "Kiem tra vi tri nhanh hon",
    ],
    tipLabel: "TIP",
    tipBody: "Ban co the moi thanh vien bang ma moi ma khong can duyet thu cong",
    shareInviteNow: "Chia se ma moi ngay",
    maybeLater: "De sau",
    uploadEmblem: "Tai logo clb",
    fieldRequiredMark: "*",
    activityGroundPlaceholder: "San hoat dong",
    searchGround: "Tim san",
    foundedDatePlaceholder: "YYYYMMDD",
    selectPlaceholder: "Hay chon",
    feePlaceholder: "Hoi phi",
    imageUploadFailed: "Khong the tai anh len.",
    inviteShareFailed: "Khong the chia se ma moi.",
    stepGuard: "Hay hoan thanh buoc truoc do.",
    emblemUploadHint: "Hay tai len logo tron cho clb.",
    uniformColorHint: "Co the chon toi da 3 mau.",
    scheduleHint: "Co the chon nhieu muc.",
    photoHint: "Anh nay se hien thi o phan dau ho so clb.",
    completeShareMessage: "Hay chia se ma moi de moi thanh vien tham gia nhanh hon.",
  },
  en: {
    title: "Create Club",
    progressLabel: "Step",
    basicHeading: "Enter the club's basic information",
    scheduleHeading: "Set the main schedule and team introduction",
    tacticsHeading: "Set the club's tactical identity",
    sportType: "Sport type",
    teamName: "Club name",
    foundedDate: "Founded date (8 digits)",
    province: "City",
    district: "District",
    homeGround: "Home ground",
    genderType: "Team composition",
    ageGroups: "Age groups",
    uniformColors: "Uniform colors (max 3)",
    next: "Next",
    register: "Register",
    back: "Back",
    matchSchedule: "Main match day / time",
    teamPhoto: "Team cover photo",
    uploadTeamPhoto: "Upload club photo",
    description: "Club description",
    descriptionPlaceholder: "Introduce your club. This appears on the team profile and helps other players and teams understand your club better.",
    hasMonthlyFee: "Monthly fee enabled",
    monthlyFeeHelper: "Members will receive a monthly reminder",
    monthlyFeeUnit: "KRW",
    monthlyFeeValidation: "Enter the monthly fee as numbers only.",
    formationA: "Plan A formation",
    formationB: "Plan B formation",
    tacticStyle: "Tactical style",
    attackDirection: "Attack direction",
    defenseStyle: "Defensive style",
    completeTitle: "Your club is ready!",
    completeSubtitle: "Now you can experience the full team management flow",
    completeFeatures: [
      "Set lineups with one hand",
      "Track matches in real time",
      "Run encouraging MVP voting",
      "Check positions quickly",
    ],
    tipLabel: "TIP",
    tipBody: "Share the invite code so teammates can join without manual approval",
    shareInviteNow: "Share invite code now",
    maybeLater: "Maybe later",
    uploadEmblem: "Upload club emblem",
    fieldRequiredMark: "*",
    activityGroundPlaceholder: "Home ground",
    searchGround: "Search ground",
    foundedDatePlaceholder: "YYYYMMDD",
    selectPlaceholder: "Select",
    feePlaceholder: "Monthly fee",
    imageUploadFailed: "Failed to upload the image.",
    inviteShareFailed: "Unable to share the invite code.",
    stepGuard: "Complete the previous step first.",
    emblemUploadHint: "Upload a round emblem for your club.",
    uniformColorHint: "You can select up to 3 colors.",
    scheduleHint: "Multiple selections are allowed.",
    photoHint: "This image will be used at the top of the club profile.",
    completeShareMessage: "Share the invite code and bring your teammates in quickly.",
  },
};
const SPORT_OPTIONS: Record<SupportedLanguage, Option<TeamSportType>[]> = {
  ko: [
    { label: "축구", value: "soccer" },
    { label: "풋살", value: "futsal" },
    { label: "축구·풋살", value: "both" },
  ],
  vi: [
    { label: "Bong da", value: "soccer" },
    { label: "Futsal", value: "futsal" },
    { label: "Ca hai", value: "both" },
  ],
  en: [
    { label: "Soccer", value: "soccer" },
    { label: "Futsal", value: "futsal" },
    { label: "Soccer / Futsal", value: "both" },
  ],
};

const GENDER_OPTIONS: Record<SupportedLanguage, Option<TeamGenderType>[]> = {
  ko: [
    { label: "남성", value: "male" },
    { label: "여성", value: "female" },
    { label: "혼성", value: "mixed" },
  ],
  vi: [
    { label: "Nam", value: "male" },
    { label: "Nu", value: "female" },
    { label: "Hon hop", value: "mixed" },
  ],
  en: [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Mixed", value: "mixed" },
  ],
};

const AGE_GROUP_OPTIONS: Record<SupportedLanguage, Option<TeamAgeGroup>[]> = {
  ko: [
    { label: "10대", value: "10s" },
    { label: "20대", value: "20s" },
    { label: "30대", value: "30s" },
    { label: "40대", value: "40s" },
    { label: "50대", value: "50s" },
    { label: "60대 이상", value: "60_plus" },
  ],
  vi: [
    { label: "10s", value: "10s" },
    { label: "20s", value: "20s" },
    { label: "30s", value: "30s" },
    { label: "40s", value: "40s" },
    { label: "50s", value: "50s" },
    { label: "60+", value: "60_plus" },
  ],
  en: [
    { label: "10s", value: "10s" },
    { label: "20s", value: "20s" },
    { label: "30s", value: "30s" },
    { label: "40s", value: "40s" },
    { label: "50s", value: "50s" },
    { label: "60+", value: "60_plus" },
  ],
};

const MATCH_DAY_OPTIONS: Record<SupportedLanguage, Option<TeamMatchDay>[]> = {
  ko: [
    { label: "월", value: "mon" },
    { label: "화", value: "tue" },
    { label: "수", value: "wed" },
    { label: "목", value: "thu" },
    { label: "금", value: "fri" },
    { label: "토", value: "sat" },
    { label: "일", value: "sun" },
  ],
  vi: [
    { label: "T2", value: "mon" },
    { label: "T3", value: "tue" },
    { label: "T4", value: "wed" },
    { label: "T5", value: "thu" },
    { label: "T6", value: "fri" },
    { label: "T7", value: "sat" },
    { label: "CN", value: "sun" },
  ],
  en: [
    { label: "Mon", value: "mon" },
    { label: "Tue", value: "tue" },
    { label: "Wed", value: "wed" },
    { label: "Thu", value: "thu" },
    { label: "Fri", value: "fri" },
    { label: "Sat", value: "sat" },
    { label: "Sun", value: "sun" },
  ],
};

const MATCH_TIME_OPTIONS: Record<SupportedLanguage, Option<TeamMatchTime>[]> = {
  ko: [
    { label: "새벽 (0-6시)", value: "dawn" },
    { label: "아침 (6-11시)", value: "morning" },
    { label: "낮 (11-17시)", value: "day" },
    { label: "저녁 (17-21시)", value: "evening" },
    { label: "밤 (21-24시)", value: "night" },
  ],
  vi: [
    { label: "Rang sang (0-6)", value: "dawn" },
    { label: "Sang (6-11)", value: "morning" },
    { label: "Ban ngay (11-17)", value: "day" },
    { label: "Chieu toi (17-21)", value: "evening" },
    { label: "Dem (21-24)", value: "night" },
  ],
  en: [
    { label: "Dawn (0-6)", value: "dawn" },
    { label: "Morning (6-11)", value: "morning" },
    { label: "Day (11-17)", value: "day" },
    { label: "Evening (17-21)", value: "evening" },
    { label: "Night (21-24)", value: "night" },
  ],
};

const FORMATION_OPTIONS: Record<SupportedLanguage, Option<TeamFormation>[]> = {
  ko: [
    { label: "4-3-3", value: "4-3-3" },
    { label: "4-4-2", value: "4-4-2" },
    { label: "4-2-3-1", value: "4-2-3-1" },
    { label: "3-5-2", value: "3-5-2" },
    { label: "5-3-2", value: "5-3-2" },
    { label: "3-4-3", value: "3-4-3" },
    { label: "기타", value: "other" },
  ],
  vi: [
    { label: "4-3-3", value: "4-3-3" },
    { label: "4-4-2", value: "4-4-2" },
    { label: "4-2-3-1", value: "4-2-3-1" },
    { label: "3-5-2", value: "3-5-2" },
    { label: "5-3-2", value: "5-3-2" },
    { label: "3-4-3", value: "3-4-3" },
    { label: "Khac", value: "other" },
  ],
  en: [
    { label: "4-3-3", value: "4-3-3" },
    { label: "4-4-2", value: "4-4-2" },
    { label: "4-2-3-1", value: "4-2-3-1" },
    { label: "3-5-2", value: "3-5-2" },
    { label: "5-3-2", value: "5-3-2" },
    { label: "3-4-3", value: "3-4-3" },
    { label: "Other", value: "other" },
  ],
};const TACTIC_STYLE_OPTIONS: Record<SupportedLanguage, Option<TeamTacticStyle>[]> = {
  ko: [
    { label: "점유-빌드업", value: "build_up" },
    { label: "선수비-역습", value: "counter_attack" },
    { label: "균형 (빌드업-역습)", value: "balanced" },
  ],
  vi: [
    { label: "Kiem soat / Build-up", value: "build_up" },
    { label: "Phong ngu / Phan cong", value: "counter_attack" },
    { label: "Can bang", value: "balanced" },
  ],
  en: [
    { label: "Build-up", value: "build_up" },
    { label: "Counter attack", value: "counter_attack" },
    { label: "Balanced", value: "balanced" },
  ],
};

const ATTACK_DIRECTION_OPTIONS: Record<SupportedLanguage, Option<TeamAttackDirection>[]> = {
  ko: [
    { label: "중앙", value: "center" },
    { label: "양쪽 사이드", value: "both_sides" },
    { label: "왼쪽 사이드", value: "left_side" },
    { label: "오른쪽 사이드", value: "right_side" },
  ],
  vi: [
    { label: "Trung lo", value: "center" },
    { label: "Hai canh", value: "both_sides" },
    { label: "Canh trai", value: "left_side" },
    { label: "Canh phai", value: "right_side" },
  ],
  en: [
    { label: "Center", value: "center" },
    { label: "Both sides", value: "both_sides" },
    { label: "Left side", value: "left_side" },
    { label: "Right side", value: "right_side" },
  ],
};

const DEFENSE_STYLE_OPTIONS: Record<SupportedLanguage, Option<TeamDefenseStyle>[]> = {
  ko: [
    { label: "대인 방어", value: "man_to_man" },
    { label: "지역 방어", value: "zone" },
    { label: "균형 (대인-지역)", value: "balanced" },
  ],
  vi: [
    { label: "Kem nguoi", value: "man_to_man" },
    { label: "Phong ngu khu vuc", value: "zone" },
    { label: "Can bang", value: "balanced" },
  ],
  en: [
    { label: "Man to man", value: "man_to_man" },
    { label: "Zonal", value: "zone" },
    { label: "Balanced", value: "balanced" },
  ],
};

const UNIFORM_COLOR_OPTIONS: Record<SupportedLanguage, UniformColorOption[]> = {
  ko: [
    { label: "진빨강", value: "dark_red", color: "#8B1E1E" },
    { label: "빨강", value: "red", color: "#EF4444" },
    { label: "주황", value: "orange", color: "#F97316" },
    { label: "노랑", value: "yellow", color: "#FACC15" },
    { label: "진초록", value: "dark_green", color: "#166534" },
    { label: "초록", value: "green", color: "#22C55E" },
    { label: "연초록", value: "light_green", color: "#84CC16" },
    { label: "네이비", value: "navy", color: "#1E3A8A" },
    { label: "파랑", value: "blue", color: "#2563EB" },
    { label: "하늘", value: "sky", color: "#38BDF8" },
    { label: "보라", value: "purple", color: "#8B5CF6" },
    { label: "검정", value: "black", color: "#111827" },
    { label: "회색", value: "gray", color: "#9CA3AF" },
    { label: "흰색", value: "white", color: "#F9FAFB" },
  ],
  vi: [
    { label: "Do dam", value: "dark_red", color: "#8B1E1E" },
    { label: "Do", value: "red", color: "#EF4444" },
    { label: "Cam", value: "orange", color: "#F97316" },
    { label: "Vang", value: "yellow", color: "#FACC15" },
    { label: "Xanh la dam", value: "dark_green", color: "#166534" },
    { label: "Xanh la", value: "green", color: "#22C55E" },
    { label: "Xanh la nhat", value: "light_green", color: "#84CC16" },
    { label: "Navy", value: "navy", color: "#1E3A8A" },
    { label: "Xanh duong", value: "blue", color: "#2563EB" },
    { label: "Xanh troi", value: "sky", color: "#38BDF8" },
    { label: "Tim", value: "purple", color: "#8B5CF6" },
    { label: "Den", value: "black", color: "#111827" },
    { label: "Xam", value: "gray", color: "#9CA3AF" },
    { label: "Trang", value: "white", color: "#F9FAFB" },
  ],
  en: [
    { label: "Dark red", value: "dark_red", color: "#8B1E1E" },
    { label: "Red", value: "red", color: "#EF4444" },
    { label: "Orange", value: "orange", color: "#F97316" },
    { label: "Yellow", value: "yellow", color: "#FACC15" },
    { label: "Dark green", value: "dark_green", color: "#166534" },
    { label: "Green", value: "green", color: "#22C55E" },
    { label: "Light green", value: "light_green", color: "#84CC16" },
    { label: "Navy", value: "navy", color: "#1E3A8A" },
    { label: "Blue", value: "blue", color: "#2563EB" },
    { label: "Sky", value: "sky", color: "#38BDF8" },
    { label: "Purple", value: "purple", color: "#8B5CF6" },
    { label: "Black", value: "black", color: "#111827" },
    { label: "Gray", value: "gray", color: "#9CA3AF" },
    { label: "White", value: "white", color: "#F9FAFB" },
  ],
};

export function getTeamCreateCopy(language: SupportedLanguage): TeamCreateCopy {
  return COPY[language] ?? COPY.ko;
}

export function getSportTypeOptions(language: SupportedLanguage): Option<TeamSportType>[] {
  return SPORT_OPTIONS[language] ?? SPORT_OPTIONS.ko;
}

export function getGenderOptions(language: SupportedLanguage): Option<TeamGenderType>[] {
  return GENDER_OPTIONS[language] ?? GENDER_OPTIONS.ko;
}

export function getAgeGroupOptions(language: SupportedLanguage): Option<TeamAgeGroup>[] {
  return AGE_GROUP_OPTIONS[language] ?? AGE_GROUP_OPTIONS.ko;
}

export function getMatchDayOptions(language: SupportedLanguage): Option<TeamMatchDay>[] {
  return MATCH_DAY_OPTIONS[language] ?? MATCH_DAY_OPTIONS.ko;
}

export function getMatchTimeOptions(language: SupportedLanguage): Option<TeamMatchTime>[] {
  return MATCH_TIME_OPTIONS[language] ?? MATCH_TIME_OPTIONS.ko;
}

export function getFormationOptions(language: SupportedLanguage): Option<TeamFormation>[] {
  return FORMATION_OPTIONS[language] ?? FORMATION_OPTIONS.ko;
}

export function getTacticStyleOptions(language: SupportedLanguage): Option<TeamTacticStyle>[] {
  return TACTIC_STYLE_OPTIONS[language] ?? TACTIC_STYLE_OPTIONS.ko;
}

export function getAttackDirectionOptions(language: SupportedLanguage): Option<TeamAttackDirection>[] {
  return ATTACK_DIRECTION_OPTIONS[language] ?? ATTACK_DIRECTION_OPTIONS.ko;
}

export function getDefenseStyleOptions(language: SupportedLanguage): Option<TeamDefenseStyle>[] {
  return DEFENSE_STYLE_OPTIONS[language] ?? DEFENSE_STYLE_OPTIONS.ko;
}

export function getUniformColorOptions(language: SupportedLanguage): UniformColorOption[] {
  return UNIFORM_COLOR_OPTIONS[language] ?? UNIFORM_COLOR_OPTIONS.ko;
}

export function getDefaultTeamVisibility(): SupportedVisibility {
  return "public";
}