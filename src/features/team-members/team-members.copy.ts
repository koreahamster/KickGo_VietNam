import type { SupportedLanguage } from "@/types/profile.types";
import type { ManageableTeamMemberRole, TeamMemberRole } from "@/types/team.types";

export type TeamMembersLocale = SupportedLanguage;

type CopyShape = {
  screenTitle: string;
  screenSubtitle: string;
  managersHeader: string;
  playersHeader: string;
  loading: string;
  errorTitle: string;
  retry: string;
  empty: string;
  privateMember: string;
  numberLabel: string;
  numberUnset: string;
  memberCountSuffix: string;
  manageTitle: string;
  manageSubtitle: string;
  roleSheetTitle: string;
  roleSheetSubtitle: string;
  kickTitle: string;
  kickBody: string;
  cancel: string;
  applyRole: string;
  kickAction: string;
  roleChanged: string;
  memberKicked: string;
  squadNumberLabel: string;
  squadNumberPlaceholder: string;
  squadNumberSheetTitle: string;
  squadNumberSheetSubtitle: string;
  squadNumberNone: string;
  squadNumberAvailable: string;
  squadNumberTaken: string;
  squadNumberSaveError: string;
};

export const TEAM_MEMBERS_COPY: Record<TeamMembersLocale, CopyShape> = {
  ko: {
    screenTitle: "\ud300 \uba64\ubc84",
    screenSubtitle: "\ud604\uc7ac \ud300 \uad6c\uc131\uc6d0\uc744 \ud655\uc778\ud558\uace0 \uc5ed\ud560\uc744 \uad00\ub9ac\ud558\uc138\uc694.",
    managersHeader: "\uad00\ub9ac\uc790",
    playersHeader: "\uc120\uc218",
    loading: "\ud300 \uba64\ubc84\ub97c \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4.",
    errorTitle: "\ud300 \uba64\ubc84\ub97c \ubd88\ub7ec\uc624\uc9c0 \ubabb\ud588\uc2b5\ub2c8\ub2e4.",
    retry: "\ub2e4\uc2dc \uc2dc\ub3c4",
    empty: "\ub4f1\ub85d\ub41c \uba64\ubc84\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.",
    privateMember: "\ube44\uacf5\uac1c \uba64\ubc84",
    numberLabel: "\ub4f1\ubc88\ud638",
    numberUnset: "\ubbf8\uc815",
    memberCountSuffix: "\uba85",
    manageTitle: "\uba64\ubc84 \uad00\ub9ac",
    manageSubtitle: "\uc120\ud0dd\ud55c \uba64\ubc84\uc758 \uc5ed\ud560\uc744 \ubc14\uafb8\uac70\ub098 \ud300\uc5d0\uc11c \ub0b4\ubcf4\ub0bc \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
    roleSheetTitle: "\uc5ed\ud560 \ubcc0\uacbd",
    roleSheetSubtitle: "\uc0c8 \uc5ed\ud560\uc744 \uc120\ud0dd\ud558\uba74 \ubc14\ub85c \ubc18\uc601\ub429\ub2c8\ub2e4.",
    kickTitle: "\uba64\ubc84 \uac15\ud1f4",
    kickBody: "\uc815\ub9d0 \uc774 \uba64\ubc84\ub97c \uac15\ud1f4\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?",
    cancel: "\ucde8\uc18c",
    applyRole: "\ubcc0\uacbd\ud558\uae30",
    kickAction: "\uac15\ud1f4",
    roleChanged: "\uc5ed\ud560\uc774 \ubcc0\uacbd\ub418\uc5c8\uc2b5\ub2c8\ub2e4.",
    memberKicked: "\uba64\ubc84\ub97c \ud300\uc5d0\uc11c \uac15\ud1f4\ud588\uc2b5\ub2c8\ub2e4.",
    squadNumberLabel: "\ub4f1\ubc88\ud638 \uc120\ud0dd",
    squadNumberPlaceholder: "\ub4f1\ubc88\ud638\ub97c \uc120\ud0dd\ud574\uc8fc\uc138\uc694",
    squadNumberSheetTitle: "\ub4f1\ubc88\ud638 \uc124\uc815",
    squadNumberSheetSubtitle: "1\ubc88\ubd80\ud130 99\ubc88\uae4c\uc9c0 \uc911 \ube44\uc5b4 \uc788\ub294 \ubc88\ud638\ub97c \uc120\ud0dd\ud560 \uc218 \uc788\uc2b5\ub2c8\ub2e4.",
    squadNumberNone: "\ubc88\ud638 \uc5c6\uc74c",
    squadNumberAvailable: "\ube44\uc5b4\uc788\uc74c",
    squadNumberTaken: "\uc774\ubbf8 \uc0ac\uc6a9 \uc911\uc778 \ubc88\ud638\uc785\ub2c8\ub2e4",
    squadNumberSaveError: "\uc774\ubbf8 \uc0ac\uc6a9 \uc911\uc778 \ubc88\ud638\uc785\ub2c8\ub2e4",
  },
  vi: {
    screenTitle: "Thanh vien doi",
    screenSubtitle: "Xem danh sach thanh vien va quan ly vai tro trong doi.",
    managersHeader: "Quan ly",
    playersHeader: "Cau thu",
    loading: "Dang tai thanh vien doi.",
    errorTitle: "Khong the tai danh sach thanh vien.",
    retry: "Thu lai",
    empty: "Chua co thanh vien nao.",
    privateMember: "Thanh vien rieng tu",
    numberLabel: "So ao",
    numberUnset: "Chua co",
    memberCountSuffix: " nguoi",
    manageTitle: "Quan ly thanh vien",
    manageSubtitle: "Ban co the doi vai tro hoac loai thanh vien khoi doi.",
    roleSheetTitle: "Doi vai tro",
    roleSheetSubtitle: "Chon vai tro moi de ap dung ngay.",
    kickTitle: "Loai khoi doi",
    kickBody: "Ban co chac chan muon kick thanh vien nay khong?",
    cancel: "Huy",
    applyRole: "Cap nhat",
    kickAction: "Kick",
    roleChanged: "Da cap nhat vai tro.",
    memberKicked: "Da kick thanh vien khoi doi.",
    squadNumberLabel: "So ao",
    squadNumberPlaceholder: "Chon so ao",
    squadNumberSheetTitle: "Chon so ao",
    squadNumberSheetSubtitle: "Co the chon mot so ao con trong tu 1 den 99.",
    squadNumberNone: "Khong co so",
    squadNumberAvailable: "Con trong",
    squadNumberTaken: "So ao nay da duoc su dung",
    squadNumberSaveError: "So ao nay da duoc su dung",
  },
  en: {
    screenTitle: "Team Members",
    screenSubtitle: "Review the current roster and manage roles inside the team.",
    managersHeader: "Management",
    playersHeader: "Players",
    loading: "Loading team members.",
    errorTitle: "Could not load the team members.",
    retry: "Retry",
    empty: "No members have been registered yet.",
    privateMember: "Private member",
    numberLabel: "Number",
    numberUnset: "Unset",
    memberCountSuffix: " members",
    manageTitle: "Manage member",
    manageSubtitle: "Change the selected member role or remove them from the team.",
    roleSheetTitle: "Change role",
    roleSheetSubtitle: "Select the new role to apply immediately.",
    kickTitle: "Kick member",
    kickBody: "Are you sure you want to kick this member from the team?",
    cancel: "Cancel",
    applyRole: "Apply",
    kickAction: "Kick",
    roleChanged: "Role updated.",
    memberKicked: "Member removed from the team.",
    squadNumberLabel: "Squad number",
    squadNumberPlaceholder: "Choose a squad number",
    squadNumberSheetTitle: "Assign squad number",
    squadNumberSheetSubtitle: "Select an available number from 1 to 99.",
    squadNumberNone: "No number",
    squadNumberAvailable: "Available",
    squadNumberTaken: "This squad number is already taken.",
    squadNumberSaveError: "This squad number is already taken.",
  },
};

const ROLE_LABELS: Record<TeamMembersLocale, Record<TeamMemberRole, string>> = {
  ko: { owner: "owner", manager: "manager", captain: "captain", player: "player" },
  vi: { owner: "owner", manager: "manager", captain: "captain", player: "player" },
  en: { owner: "owner", manager: "manager", captain: "captain", player: "player" },
};

const MANAGEABLE_ROLE_LABELS: Record<TeamMembersLocale, Record<ManageableTeamMemberRole, string>> = {
  ko: { manager: "\ub9e4\ub2c8\uc800", captain: "\uc8fc\uc7a5", player: "\uc120\uc218" },
  vi: { manager: "Quan ly", captain: "Doi truong", player: "Cau thu" },
  en: { manager: "Manager", captain: "Captain", player: "Player" },
};

export function getTeamMemberRoleLabel(locale: TeamMembersLocale, role: TeamMemberRole): string {
  return ROLE_LABELS[locale]?.[role] ?? role;
}

export function getManageableRoleLabel(locale: TeamMembersLocale, role: ManageableTeamMemberRole): string {
  return MANAGEABLE_ROLE_LABELS[locale]?.[role] ?? role;
}

