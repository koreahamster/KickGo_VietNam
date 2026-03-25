import * as ImagePicker from "expo-image-picker";

import type { SupportedAvatarContentType, SupportedLanguage } from "@/types/profile.types";

export const PROFILE_HEADER_BG = "#161827";
export const PROFILE_TAG_BG = "#262a3d";
export const PROFILE_CARD_BG = "#ffffff";
export const PROFILE_PAGE_BG = "#eff1f7";
export const PROFILE_BORDER = "#e7e9f0";
export const PROFILE_TEXT_DARK = "#111827";
export const PROFILE_TEXT_SOFT = "#6b7280";
export const PROFILE_BLUE = "#3b82f6";
export const PROFILE_BLUE_SOFT = "#dbeafe";
export const PROFILE_RED = "#ff2d55";
export const PROFILE_GREEN = "#1d9e75";
export const PROFILE_OWNER_BG = "#fde68a";
export const PROFILE_OWNER_TEXT = "#92400e";

export const PROFILE_ROLE_LABELS: Record<SupportedLanguage, Record<string, string>> = {
  ko: {
    player: "선수",
    referee: "심판",
    facility_manager: "시설 관리자",
    owner: "구단주",
    manager: "매니저",
    captain: "주장",
  },
  vi: {
    player: "Cau thu",
    referee: "Trong tai",
    facility_manager: "Quan ly san",
    owner: "Owner",
    manager: "Manager",
    captain: "Captain",
  },
  en: {
    player: "Player",
    referee: "Referee",
    facility_manager: "Facility Manager",
    owner: "Owner",
    manager: "Manager",
    captain: "Captain",
  },
};

export function getAvatarContentType(asset: ImagePicker.ImagePickerAsset): SupportedAvatarContentType | null {
  const mimeType = asset.mimeType?.toLowerCase();

  if (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/webp" ||
    mimeType === "image/heic" ||
    mimeType === "image/heif"
  ) {
    return mimeType;
  }

  const sourceName = (asset.fileName ?? asset.uri).toLowerCase();

  if (sourceName.endsWith(".jpg") || sourceName.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (sourceName.endsWith(".png")) {
    return "image/png";
  }

  if (sourceName.endsWith(".webp")) {
    return "image/webp";
  }

  if (sourceName.endsWith(".heic")) {
    return "image/heic";
  }

  if (sourceName.endsWith(".heif")) {
    return "image/heif";
  }

  return null;
}

export function getAvatarFileName(
  asset: ImagePicker.ImagePickerAsset,
  contentType: SupportedAvatarContentType,
): string {
  if (asset.fileName) {
    return asset.fileName;
  }

  if (contentType === "image/png") {
    return `avatar-${Date.now()}.png`;
  }

  if (contentType === "image/webp") {
    return `avatar-${Date.now()}.webp`;
  }

  if (contentType === "image/heic") {
    return `avatar-${Date.now()}.heic`;
  }

  if (contentType === "image/heif") {
    return `avatar-${Date.now()}.heif`;
  }

  return `avatar-${Date.now()}.jpg`;
}

export function getInitials(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "KG";
  }

  const tokens = trimmed.split(/\s+/).slice(0, 2);
  return tokens.map((token) => token[0]?.toUpperCase() ?? "").join("") || trimmed.slice(0, 2).toUpperCase();
}

export function formatCompactCurrency(value: number, language: SupportedLanguage): string {
  if (!Number.isFinite(value)) {
    return language === "ko" ? "0원" : language === "vi" ? "0đ" : "$0";
  }

  if (language === "ko") {
    return `${Math.round(value).toLocaleString("ko-KR")}원`;
  }

  if (language === "vi") {
    return `${Math.round(value).toLocaleString("vi-VN")}đ`;
  }

  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export function formatDateTime(value: string | null, language: SupportedLanguage): string {
  if (!value) {
    return language === "ko" ? "일정 없음" : language === "vi" ? "Chua co lich" : "No schedule";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const locale = language === "ko" ? "ko-KR" : language === "vi" ? "vi-VN" : "en-US";

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

