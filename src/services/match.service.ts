import { supabase } from "@/lib/supabase";
import type { ApiResponse } from "@/types/profile.types";
import type {
  AttendancePollRecord,
  AttendanceResponse,
  AttendanceVoteRecord,
  CreateMatchApiResponse,
  CreateMatchInput,
  CreateMatchRequest,
  CreateMatchResult,
  CreateTournamentApiResponse,
  CreateTournamentRequest,
  CreateTournamentResult,
  MatchAttendanceSummary,
  MatchDetailRecord,
  MatchRecord,
  MatchStatus,
  TeamMatchSummaryRecord,
  TournamentBracketRecord,
  TournamentRecord,
  TournamentTeamRegistrationRecord,
  VoteAttendanceApiResponse,
  VoteAttendanceRequest,
} from "@/types/match.types";
import type { TeamRecord } from "@/types/team.types";

type FunctionErrorContext = {
  status?: number;
  clone?: () => FunctionErrorContext;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
};

type RawMatchRow = MatchRecord & {
  home_team: TeamRecord | TeamRecord[] | null;
  away_team: TeamRecord | TeamRecord[] | null;
  referee: { display_name: string | null; avatar_url: string | null } | { display_name: string | null; avatar_url: string | null }[] | null;
};

type RawTournamentRegistrationRow = Omit<TournamentTeamRegistrationRecord, "team"> & {
  team: TeamRecord | TeamRecord[] | null;
};

type RawTournamentRow = Omit<TournamentRecord, "registrations">;

type RawTournamentBracketRow = Omit<TournamentBracketRecord, "homeTeam" | "awayTeam" | "winnerTeam" | "match"> & {
  home_team: TeamRecord | TeamRecord[] | null;
  away_team: TeamRecord | TeamRecord[] | null;
  winner_team: TeamRecord | TeamRecord[] | null;
  match: MatchRecord | MatchRecord[] | null;
};

const TEAM_SELECT_COLUMNS =
  "id, name, slug, emblem_url, photo_url, country_code, province_code, district_code, home_ground, description, visibility, is_recruiting, recruitment_status, sport_type, founded_date, gender_type, age_groups, uniform_colors, match_days, match_times, monthly_fee, formation_a, formation_b, tactic_style, attack_direction, defense_style";

const MATCH_SELECT_COLUMNS = `id, home_team_id, away_team_id, scheduled_at, venue_name, sport_type, match_type, status, home_score, away_score, tier_id, created_by, created_at, updated_at, opponent_name, team_side, quarter_count, quarter_minutes, attendance_deadline_at, notice, referee_id, referee:profiles!matches_referee_id_fkey(display_name, avatar_url), home_team:teams!matches_home_team_id_fkey(${TEAM_SELECT_COLUMNS}), away_team:teams!matches_away_team_id_fkey(${TEAM_SELECT_COLUMNS})`;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function getFunctionAuthHeaders(functionName: string): Promise<Record<string, string>> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  if (!session?.access_token) {
    throw new Error("Session access token was not found.");
  }

  console.log("[match] invokeFunction auth", functionName, true);

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

function getFunctionErrorContext(error: unknown): FunctionErrorContext | null {
  if (!isObjectRecord(error)) {
    return null;
  }

  const context = error.context;
  if (!isObjectRecord(context)) {
    return null;
  }

  return context as FunctionErrorContext;
}

function extractErrorMessageFromPayload(payload: unknown): string | null {
  if (!isObjectRecord(payload)) {
    return null;
  }

  const topLevelMessage = payload.message;
  if (typeof topLevelMessage === "string" && topLevelMessage.trim()) {
    return topLevelMessage;
  }

  const topLevelError = payload.error;
  if (typeof topLevelError === "string" && topLevelError.trim()) {
    return topLevelError;
  }

  if (!isObjectRecord(topLevelError)) {
    return null;
  }

  const code = topLevelError.code;
  const message = topLevelError.message;
  if (typeof code === "string" && typeof message === "string" && message.trim()) {
    return `${code}: ${message}`;
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return null;
}

async function readFunctionErrorMessage(error: unknown): Promise<string> {
  const context = getFunctionErrorContext(error);

  if (context) {
    const statusLabel = typeof context.status === "number" ? `HTTP ${context.status}` : "HTTP error";
    const jsonTarget = typeof context.clone === "function" ? context.clone() : context;

    if (typeof jsonTarget.json === "function") {
      try {
        const payload = await jsonTarget.json();
        const message = extractErrorMessageFromPayload(payload);
        if (message) {
          return `${statusLabel} - ${message}`;
        }
      } catch {
      }
    }

    const textTarget = typeof context.clone === "function" ? context.clone() : context;
    if (typeof textTarget.text === "function") {
      try {
        const text = (await textTarget.text()).trim();
        if (text) {
          return `${statusLabel} - ${text}`;
        }
      } catch {
      }
    }

    return statusLabel;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Edge Function request failed.";
}

async function invokeFunction<TResponse>(functionName: string, body?: Record<string, unknown>): Promise<TResponse> {
  const headers = await getFunctionAuthHeaders(functionName);
  const { data, error } = await supabase.functions.invoke<TResponse>(functionName, {
    body,
    headers,
  });

  if (error) {
    const message = await readFunctionErrorMessage(error);
    console.log("[match] invokeFunction error", functionName, message);
    throw new Error(message);
  }

  if (data === null) {
    throw new Error(`Function ${functionName} returned no data.`);
  }

  return data;
}

function assertSuccess<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (!response.success) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error(fallbackMessage);
  }

  return response.data;
}

function normalizeTeam(value: TeamRecord | TeamRecord[] | null): TeamRecord | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function normalizeMatch(value: MatchRecord | MatchRecord[] | null): MatchRecord | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function normalizeReferee(value: RawMatchRow["referee"]): { display_name: string | null; avatar_url: string | null } | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function buildAttendanceSummary(votes: AttendanceVoteRecord[]): MatchAttendanceSummary {
  const base = {
    yes: 0,
    no: 0,
    maybe: 0,
    late: 0,
    unknown: 0,
    yes_count: 0,
    no_count: 0,
    maybe_count: 0,
    total_count: 0,
  };

  votes.forEach((vote) => {
    if (vote.response === "yes") {
      base.yes += 1;
      base.yes_count += 1;
    } else if (vote.response === "no") {
      base.no += 1;
      base.no_count += 1;
    } else if (vote.response === "maybe") {
      base.maybe += 1;
      base.maybe_count += 1;
    } else if (vote.response === "late") {
      base.late += 1;
      base.maybe_count += 1;
    } else {
      base.unknown += 1;
      base.maybe_count += 1;
    }
  });

  base.total_count = base.yes_count + base.no_count + base.maybe_count;
  return base;
}

function getMonthBoundary(year: number, month: number): { start: string; end: string } {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

async function getAttendancePollMap(matchIds: string[], teamId?: string | null): Promise<Record<string, AttendancePollRecord>> {
  if (matchIds.length === 0) {
    return {};
  }

  let query = supabase
    .from("attendance_polls")
    .select("id, match_id, team_id, deadline_at, created_at")
    .in("match_id", matchIds);

  if (teamId) {
    query = query.eq("team_id", teamId);
  }

  const result = await query;
  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []).reduce<Record<string, AttendancePollRecord>>((accumulator, row) => {
    if (!accumulator[row.match_id]) {
      accumulator[row.match_id] = row as AttendancePollRecord;
    }
    return accumulator;
  }, {});
}

async function getAttendanceVoteMap(pollIds: string[]): Promise<Record<string, AttendanceVoteRecord[]>> {
  if (pollIds.length === 0) {
    return {};
  }

  const result = await supabase
    .from("attendance_votes")
    .select("id, poll_id, user_id, response, responded_at, created_at")
    .in("poll_id", pollIds)
    .order("created_at", { ascending: true });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []).reduce<Record<string, AttendanceVoteRecord[]>>((accumulator, row) => {
    if (!accumulator[row.poll_id]) {
      accumulator[row.poll_id] = [];
    }
    accumulator[row.poll_id].push(row as AttendanceVoteRecord);
    return accumulator;
  }, {});
}

function normalizeMatchSummary(
  row: RawMatchRow,
  pollByMatchId: Record<string, AttendancePollRecord>,
  votesByPollId: Record<string, AttendanceVoteRecord[]>,
): TeamMatchSummaryRecord {
  const homeTeam = normalizeTeam(row.home_team);
  const awayTeam = normalizeTeam(row.away_team);
  const referee = normalizeReferee(row.referee);
  const attendancePoll = pollByMatchId[row.id] ?? null;
  const attendanceVotes = attendancePoll ? votesByPollId[attendancePoll.id] ?? [] : [];
  const normalizedMatch: MatchRecord = {
    ...row,
    referee_name: referee?.display_name ?? undefined,
    referee_avatar_url: referee?.avatar_url ?? null,
  };

  return {
    match: normalizedMatch,
    homeTeam,
    awayTeam,
    attendancePoll,
    attendanceSummary: buildAttendanceSummary(attendanceVotes),
    opponentDisplayName: row.opponent_name?.trim() || awayTeam?.name || "Opponent TBD",
  };
}

function normalizeCreateRequest(input: CreateMatchInput | CreateMatchRequest): Record<string, unknown> {
  if ("home_team_id" in input) {
    return {
      home_team_id: input.home_team_id,
      away_team_id: input.away_team_id ?? null,
      scheduled_at: input.scheduled_at,
      venue_name: input.venue_name ?? null,
      sport_type: input.sport_type,
      match_type: input.match_type,
      tier_id: input.tier_id ?? null,
    };
  }

  const homeTeamId = input.homeTeamId ?? input.teamId ?? null;
  if (!homeTeamId) {
    throw new Error("home_team_id is required.");
  }

  return {
    home_team_id: homeTeamId,
    away_team_id: input.awayTeamId ?? null,
    scheduled_at: input.scheduledAt,
    venue_name: input.venueName ?? null,
    sport_type: input.sportType,
    match_type: input.matchType ?? "friendly",
    tier_id: input.tierId ?? null,
    opponent_name: input.opponentName ?? null,
    side: input.side ?? "home",
    deadline_option: input.deadlineOption ?? "0h",
    quarter_count: input.quarterCount ?? 2,
    quarter_minutes: input.quarterMinutes ?? 25,
    notice: input.notice ?? null,
  };
}

function normalizeTournamentRegistration(row: RawTournamentRegistrationRow): TournamentTeamRegistrationRecord {
  return {
    id: row.id,
    tournament_id: row.tournament_id,
    team_id: row.team_id,
    seed_number: row.seed_number,
    created_at: row.created_at,
    team: normalizeTeam(row.team),
  };
}

function normalizeTournamentBracket(row: RawTournamentBracketRow): TournamentBracketRecord {
  return {
    id: row.id,
    tournament_id: row.tournament_id,
    round: row.round,
    match_order: row.match_order,
    home_team_id: row.home_team_id,
    away_team_id: row.away_team_id,
    match_id: row.match_id,
    winner_team_id: row.winner_team_id,
    created_at: row.created_at,
    homeTeam: normalizeTeam(row.home_team),
    awayTeam: normalizeTeam(row.away_team),
    winnerTeam: normalizeTeam(row.winner_team),
    match: normalizeMatch(row.match),
  };
}

export async function getTeamMatches(teamId: string, year?: number, month?: number): Promise<TeamMatchSummaryRecord[]> {
  let query = supabase
    .from("matches")
    .select(MATCH_SELECT_COLUMNS)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order("scheduled_at", { ascending: true });

  if (typeof year === "number" && typeof month === "number") {
    const boundary = getMonthBoundary(year, month);
    query = query.gte("scheduled_at", boundary.start).lte("scheduled_at", boundary.end);
  }

  const result = await query;
  if (result.error) {
    throw new Error(result.error.message);
  }

  const rows = (result.data ?? []) as RawMatchRow[];
  const pollByMatchId = await getAttendancePollMap(rows.map((row) => row.id), teamId);
  const votesByPollId = await getAttendanceVoteMap(Object.values(pollByMatchId).map((poll) => poll.id));

  return rows.map((row) => normalizeMatchSummary(row, pollByMatchId, votesByPollId));
}

export async function getMatchDetail(matchId: string): Promise<MatchDetailRecord> {
  const result = await supabase.from("matches").select(MATCH_SELECT_COLUMNS).eq("id", matchId).maybeSingle();
  if (result.error) {
    throw new Error(result.error.message);
  }

  if (!result.data) {
    throw new Error("Match detail is unavailable.");
  }

  const row = result.data as RawMatchRow;
  const pollByMatchId = await getAttendancePollMap([row.id]);
  const votesByPollId = await getAttendanceVoteMap(Object.values(pollByMatchId).map((poll) => poll.id));

  return normalizeMatchSummary(row, pollByMatchId, votesByPollId);
}

export async function createMatch(input: CreateMatchInput | CreateMatchRequest): Promise<CreateMatchResult> {
  const response = await invokeFunction<CreateMatchApiResponse>("create-match", normalizeCreateRequest(input));
  return assertSuccess(response, "Match creation returned no data.");
}

export async function getAttendancePoll(matchId: string, teamId: string): Promise<AttendancePollRecord | null> {
  const result = await supabase
    .from("attendance_polls")
    .select("id, match_id, team_id, deadline_at, created_at")
    .eq("match_id", matchId)
    .eq("team_id", teamId)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? null) as AttendancePollRecord | null;
}

export async function getAttendanceVotes(pollId: string): Promise<AttendanceVoteRecord[]> {
  const result = await supabase
    .from("attendance_votes")
    .select("id, poll_id, user_id, response, responded_at, created_at")
    .eq("poll_id", pollId)
    .order("created_at", { ascending: true });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []) as AttendanceVoteRecord[];
}

export async function voteAttendance(
  pollId: string,
  response: Extract<AttendanceResponse, "yes" | "no" | "maybe">,
): Promise<AttendanceVoteRecord> {
  const request: VoteAttendanceRequest = {
    poll_id: pollId,
    response,
  };

  const apiResponse = await invokeFunction<VoteAttendanceApiResponse>("vote-attendance", request);
  return assertSuccess(apiResponse, "Attendance vote returned no data.");
}

export async function createTournament(request: CreateTournamentRequest): Promise<CreateTournamentResult> {
  const response = await invokeFunction<CreateTournamentApiResponse>("create-tournament", request);
  return assertSuccess(response, "Tournament creation returned no data.");
}

export async function getTournament(tournamentId: string): Promise<TournamentRecord> {
  const tournamentResult = await supabase
    .from("tournaments")
    .select("id, name, host_team_id, province_code, max_teams, status, created_by, created_at")
    .eq("id", tournamentId)
    .maybeSingle<RawTournamentRow>();

  if (tournamentResult.error) {
    throw new Error(tournamentResult.error.message);
  }

  if (!tournamentResult.data) {
    throw new Error("Tournament detail is unavailable.");
  }

  const registrationsResult = await supabase
    .from("tournament_team_registrations")
    .select(`id, tournament_id, team_id, seed_number, created_at, team:teams(${TEAM_SELECT_COLUMNS})`)
    .eq("tournament_id", tournamentId)
    .order("created_at", { ascending: true });

  if (registrationsResult.error) {
    throw new Error(registrationsResult.error.message);
  }

  return {
    ...tournamentResult.data,
    registrations: ((registrationsResult.data ?? []) as RawTournamentRegistrationRow[]).map(normalizeTournamentRegistration),
  };
}

export async function getTournamentBrackets(tournamentId: string): Promise<TournamentBracketRecord[]> {
  const result = await supabase
    .from("tournament_brackets")
    .select(`id, tournament_id, round, match_order, home_team_id, away_team_id, match_id, winner_team_id, created_at, home_team:teams!tournament_brackets_home_team_id_fkey(${TEAM_SELECT_COLUMNS}), away_team:teams!tournament_brackets_away_team_id_fkey(${TEAM_SELECT_COLUMNS}), winner_team:teams!tournament_brackets_winner_team_id_fkey(${TEAM_SELECT_COLUMNS}), match:matches(${MATCH_SELECT_COLUMNS})`)
    .eq("tournament_id", tournamentId)
    .order("round", { ascending: true })
    .order("match_order", { ascending: true });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return ((result.data ?? []) as RawTournamentBracketRow[]).map(normalizeTournamentBracket);
}

export function getMatchStatusTone(status: MatchStatus): { backgroundColor: string; color: string } {
  switch (status) {
    case "ongoing":
      return { backgroundColor: "#dcfce7", color: "#166534" };
    case "finished":
    case "finalized":
    case "auto_finalized":
      return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
    case "cancelled":
      return { backgroundColor: "#fee2e2", color: "#b91c1c" };
    case "disputed":
      return { backgroundColor: "#ede9fe", color: "#6d28d9" };
    case "awaiting_confirmation":
    case "awaiting_result":
      return { backgroundColor: "#fef3c7", color: "#b45309" };
    default:
      return { backgroundColor: "#f3f4f6", color: "#4b5563" };
  }
}
