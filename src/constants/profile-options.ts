import type { AccountType, SupportedLanguage, SupportedVisibility } from "@/types/profile.types";

import {
  getVietnamDistrictOptions,
  getVietnamProvinceOptions,
  type RegionOption,
  type VietnamProvinceGroup,
  VIETNAM_REGION_GROUPS,
} from "../../shared/regions/vietnam-regions";

export type SelectOption = RegionOption;
export type ProvinceGroup = VietnamProvinceGroup;

export const COUNTRY_OPTIONS: SelectOption[] = [{ label: "Vietnam", value: "VN" }];

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { label: "한국어", value: "ko" },
  { label: "Tiếng Việt", value: "vi" },
  { label: "English", value: "en" },
];

const VISIBILITY_LABELS: Record<SupportedLanguage, Record<SupportedVisibility, string>> = {
  ko: {
    public: "전체 공개",
    members_only: "멤버만",
    private: "비공개",
  },
  vi: {
    public: "Công khai",
    members_only: "Chỉ thành viên",
    private: "Riêng tư",
  },
  en: {
    public: "Public",
    members_only: "Members Only",
    private: "Private",
  },
};

const ACCOUNT_TYPE_LABELS: Record<SupportedLanguage, Record<AccountType, string>> = {
  ko: {
    player: "선수",
    referee: "심판",
    facility_manager: "시설 관리자",
  },
  vi: {
    player: "Cầu thủ",
    referee: "Trọng tài",
    facility_manager: "Quản lý sân",
  },
  en: {
    player: "Player",
    referee: "Referee",
    facility_manager: "Facility Manager",
  },
};

const FOOT_LABELS: Record<SupportedLanguage, Record<"right" | "left" | "both", string>> = {
  ko: {
    right: "오른발",
    left: "왼발",
    both: "양발",
  },
  vi: {
    right: "Chân phải",
    left: "Chân trái",
    both: "Hai chân",
  },
  en: {
    right: "Right",
    left: "Left",
    both: "Both",
  },
};

export const VISIBILITY_OPTIONS: SelectOption[] = getVisibilityOptions("en");
export const ACCOUNT_TYPE_OPTIONS: SelectOption[] = getAccountTypeOptions("en");
export const FOOT_OPTIONS: SelectOption[] = getFootOptions("en");

export const POSITION_OPTIONS: SelectOption[] = [
  { label: "Goalkeeper (GK)", value: "GK" },
  { label: "Center Back (CB)", value: "CB" },
  { label: "Full Back (FB)", value: "FB" },
  { label: "Defensive Midfielder (DM)", value: "DM" },
  { label: "Central Midfielder (CM)", value: "CM" },
  { label: "Attacking Midfielder (AM)", value: "AM" },
  { label: "Winger (WG)", value: "WG" },
  { label: "Striker (ST)", value: "ST" },
];

export const TOP_SIZE_OPTIONS: SelectOption[] = [
  { label: "XS", value: "XS" },
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
  { label: "2XL", value: "2XL" },
  { label: "3XL", value: "3XL" },
  { label: "4XL", value: "4XL" },
];

export const SHOE_SIZE_OPTIONS: SelectOption[] = [
  { label: "235", value: "235" },
  { label: "240", value: "240" },
  { label: "245", value: "245" },
  { label: "250", value: "250" },
  { label: "255", value: "255" },
  { label: "260", value: "260" },
  { label: "265", value: "265" },
  { label: "270", value: "270" },
  { label: "275", value: "275" },
  { label: "280", value: "280" },
  { label: "285", value: "285" },
  { label: "290", value: "290" },
  { label: "295", value: "295" },
  { label: "300", value: "300" },
  { label: "305", value: "305" },
];

export { VIETNAM_REGION_GROUPS };

export function getVisibilityOptions(language: SupportedLanguage): SelectOption[] {
  return [
    { label: VISIBILITY_LABELS[language].public, value: "public" },
    { label: VISIBILITY_LABELS[language].members_only, value: "members_only" },
    { label: VISIBILITY_LABELS[language].private, value: "private" },
  ];
}

export function getAccountTypeOptions(language: SupportedLanguage): SelectOption[] {
  return [
    { label: ACCOUNT_TYPE_LABELS[language].player, value: "player" },
    { label: ACCOUNT_TYPE_LABELS[language].referee, value: "referee" },
    { label: ACCOUNT_TYPE_LABELS[language].facility_manager, value: "facility_manager" },
  ];
}

export function getFootOptions(language: SupportedLanguage): SelectOption[] {
  return [
    { label: FOOT_LABELS[language].right, value: "right" },
    { label: FOOT_LABELS[language].left, value: "left" },
    { label: FOOT_LABELS[language].both, value: "both" },
  ];
}

export function getProvinceOptions(countryCode: string | null): SelectOption[] {
  if (countryCode !== "VN") {
    return [];
  }

  return getVietnamProvinceOptions();
}

export function getDistrictOptions(provinceCode: string | null): SelectOption[] {
  return getVietnamDistrictOptions(provinceCode);
}

export function getOptionLabel(options: SelectOption[], value: string | null): string | null {
  if (!value) {
    return null;
  }

  return options.find((option) => option.value === value)?.label ?? null;
}
