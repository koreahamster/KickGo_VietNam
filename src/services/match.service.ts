import { supabase } from "@/lib/supabase";
import type { ApiResponse } from "@/types/profile.types";
import type {
  AttendancePollRecord,
  AttendanceResponse,
  AttendanceVoteRecord,
  CreateMatchApiResponse,
  CreateMatchInput,
  CreateMatchResult,
  MatchAttendanceSummary,
  MatchDetailRecord,
  MatchRecord,
  TeamMatchSummaryRecord,
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
};

type RawAttendancePollRow = AttendancePollRecord;

type RawAttendanceVoteRow = AttendanceVoteRecord;

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
        // fall through
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
        // fall through
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

function getAttendanceSummary(votes: RawAttendanceVoteRow[]): MatchAttendanceSummary {
  return votes.reduce<MatchAttendanceSummary>(
    (summary, vote) => {
      if (vote.response === "yes") {
        summary.yes += 1;
      } else if (vote.response === "late") {
        summary.late += 1;
      } else if (vote.response === "no") {
        summary.no += 1;
      } else {
        summary.unknown += 1;
      }

      return summary;
    },
    { yes: 0, late: 0, no: 0, unknown: 0 },
  );
}

async function getAttendancePolls(matchIds: string[]): Promise<Record<string, RawAttendancePollRow>> {
  if (matchIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("attendance_polls")
    .select("id, match_id, team_id, deadline_at, created_at")
    .in("match_id", matchIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).reduce<Record<string, RawAttendancePollRow>>((accumulator, row) => {
    if (!accumulator[row.match_id]) {
      accumulator[row.match_id] = row as RawAttendancePollRow;
    }

    return accumulator;
  }, {});
}

async function getAttendanceVotes(pollIds: string[]): Promise<Record<string, RawAttendanceVoteRow[]>> {
  if (pollIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("attendance_votes")
    .select("id, poll_id, user_id, response, responded_at, created_at")
    .in("poll_id", pollIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).reduce<Record<string, RawAttendanceVoteRow[]>>((accumulator, row) => {
    const key = row.poll_id;

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(row as RawAttendanceVoteRow);
    return accumulator;
  }, {});
}

function normalizeMatchSummary(
  row: RawMatchRow,
  pollByMatchId: Record<string, RawAttendancePollRow>,
  votesByPollId: Record<string, RawAttendanceVoteRow[]>,
): TeamMatchSummaryRecord {
  const homeTeam = normalizeTeam(row.home_team);
  const awayTeam = normalizeTeam(row.away_team);
  const attendancePoll = pollByMatchId[row.id] ?? null;
  const attendanceVotes = attendancePoll ? votesByPollId[attendancePoll.id] ?? [] : [];
  const attendanceSummary = getAttendanceSummary(attendanceVotes);
  const opponentDisplayName = row.opponent_name?.trim() || awayTeam?.name || "Opponent TBD";

  return {
    match: row,
    homeTeam,
    awayTeam,
    attendancePoll,
    attendanceSummary,
    opponentDisplayName,
  };
}

export async function createMatch(input: CreateMatchInput): Promise<CreateMatchResult> {
  const response = await invokeFunction<CreateMatchApiResponse>("create-match", {
    team_id: input.teamId,
    scheduled_at: input.scheduledAt,
    sport_type: input.sportType,
    match_type: input.matchType ?? "friendly",
    side: input.side ?? "home",
    deadline_option: input.deadlineOption ?? "0h",
    quarter_count: input.quarterCount,
    quarter_minutes: input.quarterMinutes,
    venue_name: input.venueName,
    opponent_name: input.opponentName,
    notice: input.notice,
  });

  return assertSuccess(response, "Match creation returned no data.");
}

export async function getTeamMatches(teamId: string): Promise<TeamMatchSummaryRecord[]> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, home_team_id, away_team_id, scheduled_at, venue_name, sport_type, match_type, status, opponent_name, team_side, quarter_count, quarter_minutes, attendance_deadline_at, notice, created_at, updated_at, home_team:teams!matches_home_team_id_fkey(id, name, slug, emblem_url, country_code, province_code, district_code, description, visibility, is_recruiting), away_team:teams!matches_away_team_id_fkey(id, name, slug, emblem_url, country_code, province_code, district_code, description, visibility, is_recruiting)",
    )
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order("scheduled_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as RawMatchRow[];
  const pollByMatchId = await getAttendancePolls(rows.map((row) => row.id));
  const votesByPollId = await getAttendanceVotes(Object.values(pollByMatchId).map((poll) => poll.id));

  return rows.map((row) => normalizeMatchSummary(row, pollByMatchId, votesByPollId));
}

export async function getMatchDetail(matchId: string): Promise<MatchDetailRecord> {
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, home_team_id, away_team_id, scheduled_at, venue_name, sport_type, match_type, status, opponent_name, team_side, quarter_count, quarter_minutes, attendance_deadline_at, notice, created_at, updated_at, home_team:teams!matches_home_team_id_fkey(id, name, slug, emblem_url, country_code, province_code, district_code, description, visibility, is_recruiting), away_team:teams!matches_away_team_id_fkey(id, name, slug, emblem_url, country_code, province_code, district_code, description, visibility, is_recruiting)",
    )
    .eq("id", matchId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Match detail is unavailable.");
  }

  const row = data as RawMatchRow;
  const pollByMatchId = await getAttendancePolls([row.id]);
  const votesByPollId = await getAttendanceVotes(Object.values(pollByMatchId).map((poll) => poll.id));

  return normalizeMatchSummary(row, pollByMatchId, votesByPollId);
}