import type { ApiResponse } from "@/types/profile.types";
import type { TeamRecord } from "@/types/team.types";

export type MatchSportType = "soccer" | "futsal";
export type MatchType = "friendly" | "league" | "tournament";
export type MatchStatus =
  | "scheduled"
  | "ongoing"
  | "awaiting_confirmation"
  | "awaiting_result"
  | "finalized"
  | "disputed"
  | "auto_finalized"
  | "cancelled";
export type MatchTeamSide = "home" | "away";
export type MatchDeadlineOption = "24h" | "12h" | "0h";
export type AttendanceResponse = "yes" | "no" | "late" | "unknown";

export type MatchRecord = {
  id: string;
  home_team_id: string;
  away_team_id: string | null;
  scheduled_at: string;
  venue_name: string | null;
  sport_type: MatchSportType;
  match_type: MatchType;
  status: MatchStatus;
  opponent_name: string | null;
  team_side: MatchTeamSide;
  quarter_count: number;
  quarter_minutes: number;
  attendance_deadline_at: string | null;
  notice: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendancePollRecord = {
  id: string;
  match_id: string;
  team_id: string;
  deadline_at: string | null;
  created_at: string;
};

export type AttendanceVoteRecord = {
  id: string;
  poll_id: string;
  user_id: string;
  response: AttendanceResponse;
  responded_at: string | null;
  created_at: string;
};

export type MatchAttendanceSummary = {
  yes: number;
  late: number;
  no: number;
  unknown: number;
};

export type TeamMatchSummaryRecord = {
  match: MatchRecord;
  homeTeam: TeamRecord | null;
  awayTeam: TeamRecord | null;
  attendancePoll: AttendancePollRecord | null;
  attendanceSummary: MatchAttendanceSummary;
  opponentDisplayName: string;
};

export type MatchDetailRecord = TeamMatchSummaryRecord;

export type CreateMatchInput = {
  teamId: string;
  scheduledAt: string;
  sportType: MatchSportType;
  matchType?: MatchType;
  side?: MatchTeamSide;
  deadlineOption?: MatchDeadlineOption;
  quarterCount: number;
  quarterMinutes: number;
  venueName?: string;
  opponentName?: string;
  notice?: string;
};

export type CreateMatchResult = {
  match_id: string;
  attendance_poll_id: string;
  status: MatchStatus | string;
};

export type CreateMatchApiResponse = ApiResponse<CreateMatchResult>;