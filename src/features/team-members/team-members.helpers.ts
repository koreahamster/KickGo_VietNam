import type { TeamMembersLocale } from "@/features/team-members/team-members.copy";
import { TEAM_MEMBERS_COPY } from "@/features/team-members/team-members.copy";
import type { TeamMemberRole, TeamRosterMemberRecord } from "@/types/team.types";

export type TeamMembersHeaderItem = {
  type: "header";
  key: string;
  title: string;
  count: number;
};

export type TeamMembersMemberItem = {
  type: "member";
  key: string;
  member: TeamRosterMemberRecord;
};

export type TeamMembersListItem = TeamMembersHeaderItem | TeamMembersMemberItem;

export function getTeamMembersLocale(language: string): TeamMembersLocale {
  if (language === "ko" || language === "vi" || language === "en") {
    return language;
  }

  return "en";
}

export function getTeamMemberDisplayName(
  locale: TeamMembersLocale,
  member: TeamRosterMemberRecord,
): string {
  return member.profile?.display_name?.trim() || TEAM_MEMBERS_COPY[locale].privateMember;
}

export function buildTeamMembersListItems(
  locale: TeamMembersLocale,
  members: TeamRosterMemberRecord[],
): TeamMembersListItem[] {
  const copy = TEAM_MEMBERS_COPY[locale];
  const roleOrder: Record<TeamMemberRole, number> = { owner: 0, manager: 1, captain: 2, player: 3 };
  const sortedMembers = [...members].sort((left, right) => {
    const roleDiff = roleOrder[left.role] - roleOrder[right.role];

    if (roleDiff !== 0) {
      return roleDiff;
    }

    const leftNumber = left.squad_number ?? Number.MAX_SAFE_INTEGER;
    const rightNumber = right.squad_number ?? Number.MAX_SAFE_INTEGER;

    if (leftNumber !== rightNumber) {
      return leftNumber - rightNumber;
    }

    const leftName = left.profile?.display_name?.trim() ?? "";
    const rightName = right.profile?.display_name?.trim() ?? "";
    return leftName.localeCompare(rightName);
  });

  const managers = sortedMembers.filter((member) => member.role === "owner" || member.role === "manager");
  const players = sortedMembers.filter((member) => member.role === "captain" || member.role === "player");
  const items: TeamMembersListItem[] = [];

  if (managers.length > 0) {
    items.push({ type: "header", key: "management", title: copy.managersHeader, count: managers.length });
    managers.forEach((member) => items.push({ type: "member", key: member.id, member }));
  }

  if (players.length > 0) {
    items.push({ type: "header", key: "players", title: copy.playersHeader, count: players.length });
    players.forEach((member) => items.push({ type: "member", key: member.id, member }));
  }

  return items;
}
