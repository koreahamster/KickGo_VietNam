import type { SupportedLanguage } from "@/types/profile.types";

function normalizeLocale(value: string): string {
  return value.trim().toLowerCase();
}

export function detectPreferredLanguage(): SupportedLanguage {
  try {
    const locale = normalizeLocale(Intl.DateTimeFormat().resolvedOptions().locale);

    if (locale.startsWith("ko")) {
      return "ko";
    }

    if (locale.startsWith("en")) {
      return "en";
    }

    if (locale.startsWith("vi")) {
      return "vi";
    }
  } catch {
    return "vi";
  }

  return "vi";
}
