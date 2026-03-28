import type { ApiResponse } from "./profile.types";
import type { TeamRecord } from "./team.types";

export type MatchSportType = "soccer" | "futsal";
export type MatchType = "friendly" | "league" | "tournament";
export type MatchStatus =
  | "scheduled"
  | "ongoing"
  | "finished"
  | "cancelled"
  | "disputed"
  | "finalized"
  | "awaiting_confirmation"
  | "awaiting_result"
  | "auto_finalized";
export type MatchTeamSide = "home" | "away";
export type MatchDeadlineOption = "24h" | "12h" | "0h";
export type AttendanceResponse = "yes" | "no" | "maybe" | "late" | "unknown";
export type TournamentStatus = "open" | "in_progress" | "finished";

export type MatchRecord = {
  id: string;
  home_team_id: string;
  away_team_id: string | null;
  scheduled_at: string;
  venue_name: string | null;
  sport_type: MatchSportType;
  match_type: MatchType;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  tier_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  opponent_name: string | null;
  team_side: MatchTeamSide;
  quarter_count: number;
  quarter_minutes: number;
  attendance_deadline_at: string | null;
  notice: string | null;
  referee_id: string | null;
  referee_name?: string;
  referee_avatar_url?: string | null;
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

export type AttendanceSummary = {
  yes_count: number;
  no_count: number;
  maybe_count: number;
  total_count: number;
};

export type MatchAttendanceSummary = AttendanceSummary & {
  yes: number;
  no: number;
  maybe: number;
  late: number;
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

export type TournamentTeamRegistrationRecord = {
  id: string;
  tournament_id: string;
  team_id: string;
  seed_number: number | null;
  created_at: string;
  team: TeamRecord | null;
};

export type TournamentRecord = {
  id: string;
  name: string;
  host_team_id: string;
  province_code: string | null;
  max_teams: number;
  status: TournamentStatus;
  created_by: string | null;
  created_at: string;
  registrations: TournamentTeamRegistrationRecord[];
};

export type TournamentBracketRecord = {
  id: string;
  tournament_id: string;
  round: number;
  match_order: number;
  home_team_id: string | null;
  away_team_id: string | null;
  match_id: string | null;
  winner_team_id: string | null;
  created_at: string;
  homeTeam: TeamRecord | null;
  awayTeam: TeamRecord | null;
  winnerTeam: TeamRecord | null;
  match: MatchRecord | null;
};

export type CreateMatchRequest = {
  home_team_id: string;
  away_team_id?: string | null;
  scheduled_at: string;
  venue_name?: string | null;
  sport_type: MatchSportType;
  match_type: MatchType;
  tier_id?: string | null;
};

export type CreateMatchInput = {
  teamId?: string;
  homeTeamId?: string;
  awayTeamId?: string | null;
  scheduledAt: string;
  venueName?: string;
  sportType: MatchSportType;
  matchType?: MatchType;
  tierId?: string | null;
  side?: MatchTeamSide;
  deadlineOption?: MatchDeadlineOption;
  quarterCount?: number;
  quarterMinutes?: number;
  opponentName?: string;
  notice?: string;
};

export type CreateMatchResult = MatchRecord;

export type VoteAttendanceRequest = {
  poll_id: string;
  response: Extract<AttendanceResponse, "yes" | "no" | "maybe">;
};

export type CreateTournamentRequest = {
  name: string;
  host_team_id: string;
  province_code: string;
  team_ids: string[];
};

export type CreateTournamentResult = TournamentRecord;

export type Match = MatchRecord;
export type AttendancePoll = AttendancePollRecord;
export type AttendanceVote = AttendanceVoteRecord;
export type Tournament = TournamentRecord;
export type TournamentTeamRegistration = TournamentTeamRegistrationRecord;
export type TournamentBracket = TournamentBracketRecord;

export type CreateMatchApiResponse = ApiResponse<CreateMatchResult>;
export type VoteAttendanceApiResponse = ApiResponse<AttendanceVoteRecord>;
export type CreateTournamentApiResponse = ApiResponse<CreateTournamentResult>;
