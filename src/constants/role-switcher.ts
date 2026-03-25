import { Ionicons } from "@expo/vector-icons";

import type { SupportedLanguage } from "@/types/profile.types";
import type { ActiveRole } from "@/store/role-switch.store";

export type RoleTabRoute =
  | "home"
  | "team"
  | "social"
  | "search"
  | "profile"
  | "schedule"
  | "match-control"
  | "revenue"
  | "booking-management"
  | "facility-management";

type RoleTabDefinition = {
  name: RoleTabRoute;
  icon: keyof typeof Ionicons.glyphMap;
  labels: Record<SupportedLanguage, string>;
};

type RoleSwitcherCopy = {
  title: string;
  currentRole: string;
  roleSectionTitle: string;
  addRole: string;
  menuSectionTitle: string;
  notifications: string;
  language: string;
  privacyPolicy: string;
  logout: string;
  loadingProfile: string;
  guestName: string;
};

const ROLE_LABELS: Record<SupportedLanguage, Record<ActiveRole, string>> = {
  ko: {
    player: "선수 모드",
    referee: "심판 모드",
    facility_manager: "시설 관리자 모드",
  },
  vi: {
    player: "Chế độ cầu thủ",
    referee: "Chế độ trọng tài",
    facility_manager: "Chế độ quản lý sân",
  },
  en: {
    player: "Player Mode",
    referee: "Referee Mode",
    facility_manager: "Facility Manager Mode",
  },
};

const ROLE_SWITCHER_COPY: Record<SupportedLanguage, RoleSwitcherCopy> = {
  ko: {
    title: "역할 전환",
    currentRole: "현재 활성 역할",
    roleSectionTitle: "역할",
    addRole: "역할 추가",
    menuSectionTitle: "메뉴",
    notifications: "알림",
    language: "언어 설정",
    privacyPolicy: "개인정보처리방침",
    logout: "로그아웃",
    loadingProfile: "프로필을 불러오는 중입니다.",
    guestName: "KickGo 사용자",
  },
  vi: {
    title: "Chuyển vai trò",
    currentRole: "Vai trò hiện tại",
    roleSectionTitle: "Vai trò",
    addRole: "Thêm vai trò",
    menuSectionTitle: "Menu",
    notifications: "Thông báo",
    language: "Ngôn ngữ",
    privacyPolicy: "Chính sách riêng tư",
    logout: "Đăng xuất",
    loadingProfile: "Đang tải hồ sơ.",
    guestName: "Người dùng KickGo",
  },
  en: {
    title: "Role Switcher",
    currentRole: "Current active role",
    roleSectionTitle: "Roles",
    addRole: "Add role",
    menuSectionTitle: "Menu",
    notifications: "Notifications",
    language: "Language",
    privacyPolicy: "Privacy Policy",
    logout: "Logout",
    loadingProfile: "Loading profile.",
    guestName: "KickGo User",
  },
};

const ROLE_TABS: Record<ActiveRole, RoleTabDefinition[]> = {
  player: [
    { name: "home", icon: "home-outline", labels: { ko: "홈", vi: "Trang chủ", en: "Home" } },
    { name: "team", icon: "shield-outline", labels: { ko: "팀", vi: "Đội", en: "Team" } },
    { name: "social", icon: "images-outline", labels: { ko: "소셜", vi: "Social", en: "Social" } },
    { name: "search", icon: "search-outline", labels: { ko: "탐색", vi: "Khám phá", en: "Explore" } },
    { name: "profile", icon: "person-outline", labels: { ko: "프로필", vi: "Hồ sơ", en: "Profile" } },
  ],
  referee: [
    { name: "home", icon: "home-outline", labels: { ko: "홈", vi: "Trang chủ", en: "Home" } },
    { name: "schedule", icon: "calendar-outline", labels: { ko: "일정", vi: "Lịch", en: "Schedule" } },
    { name: "match-control", icon: "stopwatch-outline", labels: { ko: "경기진행", vi: "Điều hành", en: "Match" } },
    { name: "revenue", icon: "wallet-outline", labels: { ko: "수익", vi: "Thu nhập", en: "Revenue" } },
    { name: "profile", icon: "person-outline", labels: { ko: "프로필", vi: "Hồ sơ", en: "Profile" } },
  ],
  facility_manager: [
    { name: "home", icon: "home-outline", labels: { ko: "홈", vi: "Trang chủ", en: "Home" } },
    {
      name: "booking-management",
      icon: "calendar-clear-outline",
      labels: { ko: "예약관리", vi: "Quản lý đặt sân", en: "Bookings" },
    },
    {
      name: "facility-management",
      icon: "business-outline",
      labels: { ko: "운동장관리", vi: "Quản lý sân", en: "Facilities" },
    },
    { name: "revenue", icon: "wallet-outline", labels: { ko: "수익", vi: "Thu nhập", en: "Revenue" } },
    { name: "profile", icon: "person-outline", labels: { ko: "프로필", vi: "Hồ sơ", en: "Profile" } },
  ],
};

export const ALL_ROLE_TAB_ROUTES: RoleTabRoute[] = [
  "home",
  "team",
  "social",
  "search",
  "profile",
  "schedule",
  "match-control",
  "revenue",
  "booking-management",
  "facility-management",
];

export function getRoleLabel(language: SupportedLanguage, role: ActiveRole): string {
  return ROLE_LABELS[language][role];
}

export function getRoleSwitcherCopy(language: SupportedLanguage): RoleSwitcherCopy {
  return ROLE_SWITCHER_COPY[language];
}

export function getRoleTabs(language: SupportedLanguage, role: ActiveRole): Array<RoleTabDefinition & { label: string }> {
  return ROLE_TABS[role].map((tab) => ({
    ...tab,
    label: tab.labels[language],
  }));
}