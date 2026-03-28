import { REFEREE_SYSTEM_EN, REFEREE_SYSTEM_STEP2_EN } from "@/core/i18n/en";
import { REFEREE_SYSTEM_KO, REFEREE_SYSTEM_STEP2_KO } from "@/core/i18n/ko";
import { REFEREE_SYSTEM_VI, REFEREE_SYSTEM_STEP2_VI } from "@/core/i18n/vi";
import type { SupportedLanguage } from "@/types/profile.types";
import type { RefereeAssignmentStatus } from "@/types/referee.types";

const MERGED_EN = { ...REFEREE_SYSTEM_EN, ...REFEREE_SYSTEM_STEP2_EN } as const;
const MERGED_KO = { ...REFEREE_SYSTEM_KO, ...REFEREE_SYSTEM_STEP2_KO } as const;
const MERGED_VI = { ...REFEREE_SYSTEM_VI, ...REFEREE_SYSTEM_STEP2_VI } as const;

export type RefereeSystemCopy = {
  [K in keyof typeof MERGED_EN]: string;
};

const COPY: Record<SupportedLanguage, RefereeSystemCopy> = {
  ko: MERGED_KO,
  vi: MERGED_VI,
  en: MERGED_EN,
};

export function getRefereeSystemCopy(language: SupportedLanguage): RefereeSystemCopy {
  return COPY[language] ?? COPY.en;
}

export function getRefereeAssignmentStatusLabel(copy: RefereeSystemCopy, status: RefereeAssignmentStatus): string {
  switch (status) {
    case "accepted":
      return copy.assignmentsAcceptedBadge;
    case "completed":
      return copy.assignmentsCompletedBadge;
    case "rejected":
      return copy.assignmentsRejectedBadge;
    case "cancelled":
      return copy.assignmentsCancelledBadge;
    default:
      return copy.assignmentsPendingBadge;
  }
}

export function getRefereeAssignmentTone(status: RefereeAssignmentStatus): { backgroundColor: string; color: string } {
  switch (status) {
    case "accepted":
      return { backgroundColor: "#dcfce7", color: "#166534" };
    case "completed":
      return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
    case "rejected":
      return { backgroundColor: "#fee2e2", color: "#b91c1c" };
    case "cancelled":
      return { backgroundColor: "#f3f4f6", color: "#475569" };
    default:
      return { backgroundColor: "#fef3c7", color: "#92400e" };
  }
}
