import { getDistrictOptions, getOptionLabel, getProvinceOptions } from "@/constants/profile-options";
import { getTeamShellCopy } from "@/features/team-shell.copy";
import type { SupportedLanguage } from "@/types/profile.types";
import type { TeamMemberRole, TeamRecord, TeamRecruitmentStatus, TeamSportType } from "@/types/team.types";

export function getTeamRoleLabel(language: SupportedLanguage, role: TeamMemberRole): string {
  const copy = getTeamShellCopy(language);

  if (role === "owner") return copy.roleOwner;
  if (role === "manager") return copy.roleManager;
  if (role === "captain") return copy.roleCaptain;
  return copy.rolePlayer;
}

export function getTeamSportLabel(language: SupportedLanguage, sportType: TeamSportType | null): string {
  const copy = getTeamShellCopy(language);

  if (sportType === "futsal") return copy.sportFutsal;
  if (sportType === "both") return copy.sportBoth;
  return copy.sportSoccer;
}

export function getTeamRegionLabels(team: Pick<TeamRecord, "province_code" | "district_code">): string[] {
  const provinceLabel = getOptionLabel(getProvinceOptions("VN"), team.province_code);
  const districtLabel = getOptionLabel(getDistrictOptions(team.province_code), team.district_code);

  return [provinceLabel, districtLabel].filter((value): value is string => Boolean(value));
}

export function buildTeamInitial(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "T";
}

export function getTeamRecruitmentStatus(
  team: Pick<TeamRecord, "recruitment_status" | "is_recruiting">,
): TeamRecruitmentStatus {
  if (team.recruitment_status === "open" || team.recruitment_status === "closed" || team.recruitment_status === "invite_only") {
    return team.recruitment_status;
  }

  return team.is_recruiting ? "open" : "closed";
}

export function getTeamRecruitmentLabel(
  language: SupportedLanguage,
  team: Pick<TeamRecord, "recruitment_status" | "is_recruiting">,
): string {
  const copy = getTeamShellCopy(language);
  const status = getTeamRecruitmentStatus(team);

  if (status === "invite_only") {
    return copy.recruitingInviteOnly;
  }

  return status === "open" ? copy.recruitingOpen : copy.recruitingClosed;
}

export function getRecruitmentStatusTone(team: Pick<TeamRecord, "recruitment_status" | "is_recruiting">): {
  backgroundColor: string;
  color: string;
} {
  const status = getTeamRecruitmentStatus(team);

  if (status === "open") {
    return {
      backgroundColor: "#dcfce7",
      color: "#166534",
    };
  }

  if (status === "invite_only") {
    return {
      backgroundColor: "#dbeafe",
      color: "#1d4ed8",
    };
  }

  return {
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
  };
}