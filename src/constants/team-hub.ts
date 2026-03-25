import type { SupportedLanguage } from "@/types/profile.types";

export type TeamHubCopy = {
  dashboardTitle: string;
  dashboardSubtitle: string;
  summaryTitle: string;
  summarySubtitle: string;
  statMembers: string;
  statManagers: string;
  statMatches: string;
  statRecruiting: string;
  matchHubTitle: string;
  matchHubSubtitle: string;
  noMatchTitle: string;
  noMatchSubtitle: string;
  registerMatch: string;
  rosterButton: string;
  voteButton: string;
  lineupButton: string;
  shareCodeButton: string;
  rosterTitle: string;
  rosterSubtitle: string;
  captainBadge: string;
  managerBadge: string;
  ownerBadge: string;
  memberBadge: string;
  hiddenMember: string;
  matchCreateTitle: string;
  matchCreateSubtitle: string;
  scheduleLabel: string;
  deadlineLabel: string;
  quarterCountLabel: string;
  quarterMinutesLabel: string;
  opponentLabel: string;
  opponentPlaceholder: string;
  venueLabel: string;
  venuePlaceholder: string;
  noticeLabel: string;
  noticePlaceholder: string;
  createMatchButton: string;
  previewOnly: string;
  homeOption: string;
  awayOption: string;
  futsalOption: string;
  footballOption: string;
  matchDetailTitle: string;
  attendancePending: string;
  attendanceJoin: string;
  attendanceLeave: string;
  attendanceMaybe: string;
  attendanceOpenVote: string;
  attendanceOpenLineup: string;
  attendanceCountsTitle: string;
  voteTitle: string;
  voteSubtitle: string;
  votedTab: string;
  notVotedTab: string;
  timeTab: string;
  quarterTab: string;
  noVotes: string;
  lineupTitle: string;
  lineupSubtitle: string;
  loadPreset: string;
  resetLineup: string;
  availablePlayers: string;
  benchPlayers: string;
  shareAction: string;
  editAction: string;
  myRoleLabel: string;
  clubLabel: string;
  sideLabel: string;
  cancelLabel: string;
  noticeSectionTitle: string;
  noticeEmpty: string;
  uniformLabel: string;
  lineupPreviewTitle: string;
  noAvailablePlayers: string;
  noBenchPlayers: string;
  quarterPrefix: string;
  playersSuffix: string;
  perQuarterSuffix: string;
};

const KO: TeamHubCopy = {
  dashboardTitle: "\uD074\uB7FD \uD648",
  dashboardSubtitle: "\uD300 \uC6B4\uC601, \uB9E4\uCE58 \uC900\uBE44, \uB77C\uC778\uC5C5, \uD22C\uD45C\uB85C \uC774\uC5B4\uC9C0\uB294 \uD5C8\uBE0C \uD654\uBA74\uC785\uB2C8\uB2E4.",
  summaryTitle: "\uD074\uB7FD \uC694\uC57D",
  summarySubtitle: "\uD074\uB7FD \uC0C1\uD0DC\uC640 \uD604\uC7AC \uD300 \uAD6C\uC131\uC744 \uBA3C\uC800 \uD655\uC778\uD558\uC138\uC694.",
  statMembers: "\uBA64\uBC84",
  statManagers: "\uC6B4\uC601\uC9C4",
  statMatches: "\uB9E4\uCE58",
  statRecruiting: "\uBAA8\uC9D1",
  matchHubTitle: "\uB9E4\uCE58 \uD5C8\uBE0C",
  matchHubSubtitle: "\uB9E4\uCE58 \uB4F1\uB85D, \uD22C\uD45C, \uB77C\uC778\uC5C5 \uD654\uBA74\uC73C\uB85C \uC774\uB3D9\uD558\uB294 \uC601\uC5ED\uC785\uB2C8\uB2E4.",
  noMatchTitle: "\uC544\uC9C1 \uB4F1\uB85D\uB41C \uB9E4\uCE58\uAC00 \uC5C6\uC5B4\uC694",
  noMatchSubtitle: "\uBA3C\uC800 \uB9E4\uCE58\uB97C \uB4F1\uB85D\uD558\uACE0 \uCD9C\uC11D, \uD22C\uD45C, \uB77C\uC778\uC5C5 \uD750\uB984\uC744 \uC5F4\uC5B4\uC8FC\uC138\uC694.",
  registerMatch: "\uB9E4\uCE58 \uB4F1\uB85D",
  rosterButton: "\uB85C\uC2A4\uD130",
  voteButton: "\uD22C\uD45C",
  lineupButton: "\uB77C\uC778\uC5C5",
  shareCodeButton: "\uCD08\uB300 \uCF54\uB4DC",
  rosterTitle: "\uD604\uC7AC \uB85C\uC2A4\uD130",
  rosterSubtitle: "\uD65C\uC131 \uC0C1\uD0DC\uB85C \uCC38\uC5EC \uC911\uC778 \uD300\uC6D0 \uBAA9\uB85D\uC785\uB2C8\uB2E4.",
  captainBadge: "\uC8FC\uC7A5",
  managerBadge: "\uB9E4\uB2C8\uC800",
  ownerBadge: "\uAD6C\uB2E8\uC8FC",
  memberBadge: "\uC120\uC218",
  hiddenMember: "\uBE44\uACF5\uAC1C \uBA64\uBC84",
  matchCreateTitle: "\uB9E4\uCE58 \uB4F1\uB85D",
  matchCreateSubtitle: "\uC2E4\uC81C \uB9E4\uCE58 \uD750\uB984\uC5D0 \uC0AC\uC6A9\uD560 \uAE30\uBCF8 \uC815\uBCF4\uB97C \uC785\uB825\uD558\uC138\uC694.",
  scheduleLabel: "\uB9E4\uCE58 \uC77C\uC815",
  deadlineLabel: "\uD22C\uD45C \uB9C8\uAC10",
  quarterCountLabel: "\uCD1D \uCFFC\uD130 \uC218",
  quarterMinutesLabel: "\uCFFC\uD130\uB2F9 \uC2DC\uAC04",
  opponentLabel: "\uC0C1\uB300\uD300",
  opponentPlaceholder: "\uC608: Ddok FC",
  venueLabel: "\uAD6C\uC7A5",
  venuePlaceholder: "\uC608: Thu Duc Arena",
  noticeLabel: "\uACF5\uC9C0\uC0AC\uD56D",
  noticePlaceholder: "\uC720\uB2C8\uD3FC, \uC8FC\uCC28, \uC9D1\uD569 \uC815\uBCF4, \uC804\uC220 \uBA54\uBAA8\uB97C \uC801\uC5B4\uC8FC\uC138\uC694.",
  createMatchButton: "\uB2E4\uC74C",
  previewOnly: "\uB4F1\uB85D \uC804 \uB9E4\uCE58 \uC694\uC57D\uC744 \uBBF8\uB9AC \uD655\uC778\uD558\uC138\uC694.",
  homeOption: "\uD648",
  awayOption: "\uC6D0\uC815",
  futsalOption: "\uD48B\uC0B4",
  footballOption: "\uCD95\uAD6C",
  matchDetailTitle: "\uB9E4\uCE58 \uC0C1\uC138",
  attendancePending: "\uBBF8\uD22C\uD45C 1",
  attendanceJoin: "\uCC38\uC11D",
  attendanceLeave: "\uBD88\uCC38",
  attendanceMaybe: "\uBCF4\uB958",
  attendanceOpenVote: "\uD22C\uD45C \uBCF4\uAE30",
  attendanceOpenLineup: "\uB77C\uC778\uC5C5 \uBCF4\uAE30",
  attendanceCountsTitle: "\uD22C\uD45C \uD604\uD669",
  voteTitle: "\uC120\uC218 \uD22C\uD45C",
  voteSubtitle: "\uD22C\uD45C \uC644\uB8CC\uC640 \uBBF8\uD22C\uD45C \uC0C1\uD0DC\uB97C \uC2DC\uAC04\uBCC4 / \uCFFC\uD130\uBCC4\uB85C \uD655\uC778\uD569\uB2C8\uB2E4.",
  votedTab: "\uD22C\uD45C \uC644\uB8CC",
  notVotedTab: "\uBBF8\uD22C\uD45C",
  timeTab: "\uC2DC\uAC04\uBCC4",
  quarterTab: "\uCFFC\uD130\uBCC4",
  noVotes: "\uC544\uC9C1 \uD22C\uD45C\uD55C \uC120\uC218\uAC00 \uC5C6\uC5B4\uC694",
  lineupTitle: "\uB77C\uC778\uC5C5 \uC124\uC815",
  lineupSubtitle: "\uB9E4\uCE58\uC5D0\uC11C \uC0AC\uC6A9\uD560 \uCFFC\uD130\uBCC4 \uB77C\uC778\uC5C5\uC744 \uC124\uC815\uD569\uB2C8\uB2E4.",
  loadPreset: "\uBD88\uB7EC\uC624\uAE30",
  resetLineup: "\uCD08\uAE30\uD654",
  availablePlayers: "\uCD9C\uC804 \uAC00\uB2A5",
  benchPlayers: "\uCD9C\uC804 \uBCF4\uB958 / \uBD88\uAC00",
  shareAction: "\uACF5\uC720",
  editAction: "\uC218\uC815",
  myRoleLabel: "\uB0B4 \uC5ED\uD560",
  clubLabel: "\uD074\uB7FD",
  sideLabel: "\uAD6C\uBD84",
  cancelLabel: "\uCDE8\uC18C",
  noticeSectionTitle: "\uACF5\uC9C0\uC0AC\uD56D",
  noticeEmpty: "\uB4F1\uB85D\uB41C \uACF5\uC9C0\uAC00 \uC5C6\uC5B4\uC694.",
  uniformLabel: "\uCC29\uC6A9 \uC720\uB2C8\uD3FC",
  lineupPreviewTitle: "\uB77C\uC778\uC5C5 \uBBF8\uB9AC\uBCF4\uAE30",
  noAvailablePlayers: "\uC5F0\uACB0\uB41C \uCD9C\uC804 \uAC00\uB2A5 \uC120\uC218\uAC00 \uC544\uC9C1 \uC5C6\uC5B4\uC694.",
  noBenchPlayers: "\uBD88\uCC38, \uBCF4\uB958, \uD6C4\uBCF4 \uC120\uC218\uB97C \uC5EC\uAE30\uC5D0 \uAD6C\uC131\uD560 \uC218 \uC788\uC5B4\uC694.",
  quarterPrefix: "\uCFFC\uD130",
  playersSuffix: "\uBA85",
  perQuarterSuffix: "\uBD84",
};

const EN: TeamHubCopy = {
  dashboardTitle: "Club Home",
  dashboardSubtitle: "Use this screen as the hub for team operations, match prep, lineup, and voting.",
  summaryTitle: "Club summary",
  summarySubtitle: "Review the current club state and active roster first.",
  statMembers: "Members",
  statManagers: "Managers",
  statMatches: "Matches",
  statRecruiting: "Recruiting",
  matchHubTitle: "Match hub",
  matchHubSubtitle: "Move into match registration, voting, and lineup screens from here.",
  noMatchTitle: "No registered match yet",
  noMatchSubtitle: "Register a match first to open attendance, voting, and lineup flows.",
  registerMatch: "Register match",
  rosterButton: "Roster",
  voteButton: "Vote",
  lineupButton: "Lineup",
  shareCodeButton: "Invite code",
  rosterTitle: "Current roster",
  rosterSubtitle: "These are the members currently active in the club.",
  captainBadge: "Captain",
  managerBadge: "Manager",
  ownerBadge: "Owner",
  memberBadge: "Player",
  hiddenMember: "Private member",
  matchCreateTitle: "Match registration",
  matchCreateSubtitle: "Enter the basic match settings used for the real game flow.",
  scheduleLabel: "Schedule",
  deadlineLabel: "Vote deadline",
  quarterCountLabel: "Total quarters",
  quarterMinutesLabel: "Minutes per quarter",
  opponentLabel: "Opponent",
  opponentPlaceholder: "Ex: Ddok FC",
  venueLabel: "Venue",
  venuePlaceholder: "Ex: Thu Duc Arena",
  noticeLabel: "Notice",
  noticePlaceholder: "Write uniform, parking, meetup, or tactical notes.",
  createMatchButton: "Next",
  previewOnly: "Review the match summary before saving.",
  homeOption: "Home",
  awayOption: "Away",
  futsalOption: "Futsal",
  footballOption: "Football",
  matchDetailTitle: "Match detail",
  attendancePending: "Pending 1",
  attendanceJoin: "Attend",
  attendanceLeave: "Absent",
  attendanceMaybe: "Maybe",
  attendanceOpenVote: "Open votes",
  attendanceOpenLineup: "Open lineup",
  attendanceCountsTitle: "Vote summary",
  voteTitle: "Player vote",
  voteSubtitle: "Review voted and pending players by time or by quarter.",
  votedTab: "Voted",
  notVotedTab: "Pending",
  timeTab: "By time",
  quarterTab: "By quarter",
  noVotes: "No player has voted yet",
  lineupTitle: "Lineup setup",
  lineupSubtitle: "Set quarter-based lineups for the match.",
  loadPreset: "Load",
  resetLineup: "Reset",
  availablePlayers: "Available",
  benchPlayers: "Pending / Out",
  shareAction: "Share",
  editAction: "Edit",
  myRoleLabel: "My role",
  clubLabel: "Club",
  sideLabel: "Side",
  cancelLabel: "Cancel",
  noticeSectionTitle: "Notice",
  noticeEmpty: "No notice has been posted yet.",
  uniformLabel: "Uniform",
  lineupPreviewTitle: "Lineup preview",
  noAvailablePlayers: "No available players are connected yet.",
  noBenchPlayers: "Use this area for absent, maybe, or pending players.",
  quarterPrefix: "Quarter",
  playersSuffix: "players",
  perQuarterSuffix: "min",
};

const COPY: Record<SupportedLanguage, TeamHubCopy> = {
  ko: KO,
  vi: EN,
  en: EN,
};

export const MATCH_POSITION_GRID = [
  ["LS", "ST", "RS"],
  ["LW", "CF", "RW"],
  ["LAM", "CAM", "RAM"],
  ["LM", "LCM", "CM", "RCM", "RM"],
  ["LWB", "LDM", "CDM", "RDM", "RWB"],
  ["LB", "LCB", "SW", "RCB", "RB"],
  ["GK"],
] as const;

export function getTeamHubCopy(language: SupportedLanguage): TeamHubCopy {
  return COPY[language];
}

export function getMembershipBadgeLabel(language: SupportedLanguage, role: "owner" | "manager" | "captain" | "player"): string {
  const copy = getTeamHubCopy(language);

  if (role === "owner") {
    return copy.ownerBadge;
  }

  if (role === "manager") {
    return copy.managerBadge;
  }

  if (role === "captain") {
    return copy.captainBadge;
  }

  return copy.memberBadge;
}

export function getQuarterLabel(language: SupportedLanguage, quarterNumber: number): string {
  const copy = getTeamHubCopy(language);
  return `${copy.quarterPrefix} ${quarterNumber}`;
}
