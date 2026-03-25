import type { SupportedLanguage } from "@/types/profile.types";

export function getLocale(language: SupportedLanguage): string {
  if (language === "ko") {
    return "ko-KR";
  }

  if (language === "vi") {
    return "vi-VN";
  }

  return "en-US";
}

export function formatHomeDateTime(value: string, language: SupportedLanguage): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat(getLocale(language), {
    month: "short",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatShortDate(value: string, language: SupportedLanguage): string {
  return new Intl.DateTimeFormat(getLocale(language), {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatNumber(value: number, language: SupportedLanguage): string {
  return new Intl.NumberFormat(getLocale(language)).format(value);
}

export function formatViews(value: number, language: SupportedLanguage): string {
  return `${formatNumber(value, language)}`;
}