import { Ionicons } from "@expo/vector-icons";

import type { SupportedLanguage, AccountType } from "@/types/profile.types";
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
  noRole: string;
};

const ROLE_LABELS: Record<SupportedLanguage, Record<AccountType, string>> = {
  ko: {
    player: "\uc120\uc218",
    referee: "\uc2ec\ud310",
    facility_manager: "\uc2dc\uc124 \uad00\ub9ac\uc790",
  },
  vi: {
    player: "Cau thu",
    referee: "Trong tai",
    facility_manager: "Quan ly san",
  },
  en: {
    player: "Player",
    referee: "Referee",
    facility_manager: "Facility Manager",
  },
};

const ROLE_SWITCHER_COPY: Record<SupportedLanguage, RoleSwitcherCopy> = {
  ko: {
    title: "\uc5ed\ud560 \uc804\ud658",
    currentRole: "\ud604\uc7ac \uc5ed\ud560",
    roleSectionTitle: "\uc5ed\ud560",
    addRole: "\uc5ed\ud560 \ucd94\uac00",
    menuSectionTitle: "\uba54\ub274",
    notifications: "\uc54c\ub9bc",
    language: "\uc5b8\uc5b4 \uc124\uc815",
    privacyPolicy: "\uac1c\uc778\uc815\ubcf4\ucc98\ub9ac\ubc29\uce68",
    logout: "\ub85c\uadf8\uc544\uc6c3",
    loadingProfile: "\ud504\ub85c\ud544\uc744 \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4.",
    guestName: "KickGo \uc0ac\uc6a9\uc790",
    noRole: "\uc120\ud0dd\ub41c \uc5ed\ud560 \uc5c6\uc74c",
  },
  vi: {
    title: "Chuyen vai tro",
    currentRole: "Vai tro hien tai",
    roleSectionTitle: "Vai tro",
    addRole: "Them vai tro",
    menuSectionTitle: "Menu",
    notifications: "Thong bao",
    language: "Ngon ngu",
    privacyPolicy: "Chinh sach rieng tu",
    logout: "Dang xuat",
    loadingProfile: "Dang tai ho so.",
    guestName: "Nguoi dung KickGo",
    noRole: "Chua co vai tro",
  },
  en: {
    title: "Role Switcher",
    currentRole: "Current role",
    roleSectionTitle: "Roles",
    addRole: "Add role",
    menuSectionTitle: "Menu",
    notifications: "Notifications",
    language: "Language",
    privacyPolicy: "Privacy Policy",
    logout: "Logout",
    loadingProfile: "Loading profile.",
    guestName: "KickGo User",
    noRole: "No role selected",
  },
};

const GUEST_TABS: RoleTabDefinition[] = [
  { name: "home", icon: "home-outline", labels: { ko: "\ud648", vi: "Trang chu", en: "Home" } },
];

const ROLE_TABS: Record<AccountType, RoleTabDefinition[]> = {
  player: [
    { name: "home", icon: "home-outline", labels: { ko: "\ud648", vi: "Trang chu", en: "Home" } },
    { name: "team", icon: "shield-outline", labels: { ko: "\ud300", vi: "Doi", en: "Team" } },
    { name: "social", icon: "images-outline", labels: { ko: "\uc18c\uc15c", vi: "Social", en: "Social" } },
    { name: "search", icon: "search-outline", labels: { ko: "\ud0d0\uc0c9", vi: "Kham pha", en: "Explore" } },
    { name: "profile", icon: "person-outline", labels: { ko: "\ud504\ub85c\ud544", vi: "Ho so", en: "Profile" } },
  ],
  referee: [
    { name: "home", icon: "home-outline", labels: { ko: "\ud648", vi: "Trang chu", en: "Home" } },
    { name: "schedule", icon: "calendar-outline", labels: { ko: "\uc77c\uc815", vi: "Lich", en: "Schedule" } },
    { name: "match-control", icon: "stopwatch-outline", labels: { ko: "\uacbd\uae30\uc9c4\ud589", vi: "Tran dau", en: "Match" } },
    { name: "revenue", icon: "wallet-outline", labels: { ko: "\uc218\uc775", vi: "Thu nhap", en: "Revenue" } },
    { name: "profile", icon: "person-outline", labels: { ko: "\ud504\ub85c\ud544", vi: "Ho so", en: "Profile" } },
  ],
  facility_manager: [
    { name: "home", icon: "home-outline", labels: { ko: "\ud648", vi: "Trang chu", en: "Home" } },
    { name: "booking-management", icon: "calendar-clear-outline", labels: { ko: "\uc608\uc57d\uad00\ub9ac", vi: "Dat cho", en: "Bookings" } },
    { name: "facility-management", icon: "business-outline", labels: { ko: "\uc6b4\ub3d9\uc7a5\uad00\ub9ac", vi: "Quan ly san", en: "Facilities" } },
    { name: "revenue", icon: "wallet-outline", labels: { ko: "\uc218\uc775", vi: "Doanh thu", en: "Revenue" } },
    { name: "profile", icon: "person-outline", labels: { ko: "\ud504\ub85c\ud544", vi: "Ho so", en: "Profile" } },
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

export function getRoleLabel(language: SupportedLanguage, role: AccountType): string {
  return ROLE_LABELS[language][role];
}

export function getRoleSwitcherCopy(language: SupportedLanguage): RoleSwitcherCopy {
  return ROLE_SWITCHER_COPY[language];
}

export function getRoleTabs(language: SupportedLanguage, role: ActiveRole): Array<RoleTabDefinition & { label: string }> {
  const tabs = role ? ROLE_TABS[role] : GUEST_TABS;

  return tabs.map((tab) => ({
    ...tab,
    label: tab.labels[language],
  }));
}
