import { getDistrictOptions, getOptionLabel, getProvinceOptions } from "@/constants/profile-options";
import type { MercenaryApplicationStatus, MercenaryPostStatus, MercenaryPositionFilter } from "@/types/mercenary.types";
import type { PlayerPosition, SupportedLanguage } from "@/types/profile.types";

const POSITION_GROUP_LABELS: Record<SupportedLanguage, Record<MercenaryPositionFilter, string>> = {
  ko: { GK: "GK", DF: "DF", MF: "MF", FW: "FW" },
  vi: { GK: "GK", DF: "DF", MF: "MF", FW: "FW" },
  en: { GK: "GK", DF: "DF", MF: "MF", FW: "FW" },
};

const POSITION_FULL_LABELS: Record<SupportedLanguage, Record<PlayerPosition, string>> = {
  ko: {
    GK: "골키퍼",
    CB: "센터백",
    LB: "레프트백",
    RB: "라이트백",
    CDM: "수비형 미드필더",
    CM: "중앙 미드필더",
    CAM: "공격형 미드필더",
    LM: "레프트 미드필더",
    RM: "라이트 미드필더",
    LW: "레프트 윙",
    RW: "라이트 윙",
    CF: "센터 포워드",
    ST: "스트라이커",
  },
  vi: {
    GK: "Thu mon",
    CB: "Trung ve",
    LB: "Hau ve trai",
    RB: "Hau ve phai",
    CDM: "Tien ve phong ngu",
    CM: "Tien ve trung tam",
    CAM: "Tien ve cong",
    LM: "Tien ve trai",
    RM: "Tien ve phai",
    LW: "Canh trai",
    RW: "Canh phai",
    CF: "Ho cong",
    ST: "Tien dao",
  },
  en: {
    GK: "Goalkeeper",
    CB: "Center Back",
    LB: "Left Back",
    RB: "Right Back",
    CDM: "Defensive Midfielder",
    CM: "Central Midfielder",
    CAM: "Attacking Midfielder",
    LM: "Left Midfielder",
    RM: "Right Midfielder",
    LW: "Left Winger",
    RW: "Right Winger",
    CF: "Center Forward",
    ST: "Striker",
  },
};

export function getPositionGroupLabel(language: SupportedLanguage, value: MercenaryPositionFilter): string {
  return POSITION_GROUP_LABELS[language][value];
}

export function getPositionLabel(language: SupportedLanguage, value: PlayerPosition): string {
  return POSITION_FULL_LABELS[language][value];
}

export function getMercenaryRegionLabel(provinceCode: string, districtCode?: string | null): string {
  const provinceLabel = getOptionLabel(getProvinceOptions("VN"), provinceCode) ?? provinceCode;
  if (!districtCode) {
    return provinceLabel;
  }
  const districtLabel = getOptionLabel(getDistrictOptions(provinceCode), districtCode) ?? districtCode;
  return `${provinceLabel} · ${districtLabel}`;
}

export function formatMercenaryDateTime(value: string | null | undefined, language: SupportedLanguage): string {
  if (!value) {
    return "";
  }
  const locale = language === "ko" ? "ko-KR" : language === "vi" ? "vi-VN" : "en-US";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatRelativeTime(value: string, language: SupportedLanguage): string {
  const elapsedSeconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  const unit: Intl.RelativeTimeFormatUnit = elapsedSeconds < 86400 ? "hour" : "day";
  const divisor = unit === "hour" ? 3600 : 86400;
  const amount = Math.max(1, Math.floor(elapsedSeconds / divisor));
  const locale = language === "ko" ? "ko-KR" : language === "vi" ? "vi-VN" : "en-US";
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-amount, unit);
}

export function getPostStatusTone(status: MercenaryPostStatus): { backgroundColor: string; color: string } {
  switch (status) {
    case "closed":
      return { backgroundColor: "#e5e7eb", color: "#4b5563" };
    case "cancelled":
      return { backgroundColor: "#fee2e2", color: "#b91c1c" };
    default:
      return { backgroundColor: "#dcfce7", color: "#166534" };
  }
}

export function getApplicationStatusTone(status: MercenaryApplicationStatus): { backgroundColor: string; color: string } {
  switch (status) {
    case "accepted":
      return { backgroundColor: "#dcfce7", color: "#166534" };
    case "rejected":
      return { backgroundColor: "#fee2e2", color: "#b91c1c" };
    default:
      return { backgroundColor: "#fef3c7", color: "#b45309" };
  }
}