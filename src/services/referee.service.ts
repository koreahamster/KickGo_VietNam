import { supabase } from "@/lib/supabase";
import type { ApiResponse } from "@/types/profile.types";
import type {
  ConfirmRosterApiResponse,
  ConfirmRosterRequest,
  MatchRoster,
  RateRefereeApiResponse,
  RateRefereeRequest,
  RecordPaymentApiResponse,
  RecordPaymentRequest,
  RefereeAssignment,
  RefereeAvailability,
  RefereePaymentRecord,
  RefereeRating,
  RegisterAvailabilityApiResponse,
  RegisterAvailabilityRequest,
  RequestAssignmentApiResponse,
  RequestAssignmentRequest,
  RespondAssignmentApiResponse,
  RespondAssignmentRequest,
  SubmitRosterApiResponse,
  SubmitRosterRequest,
} from "@/types/referee.types";

type FunctionErrorContext = {
  status?: number;
  clone?: () => FunctionErrorContext;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
};

type RawProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type RawRefereeProfileRow = {
  user_id: string;
  average_rating: number | null;
};

type RawMatchRow = {
  id: string;
  scheduled_at: string;
  venue_name: string | null;
  home_team_id: string;
  away_team_id: string | null;
  home_team: { name: string | null } | { name: string | null }[] | null;
  away_team: { name: string | null } | { name: string | null }[] | null;
};

type RawRosterRow = {
  id: string;
  match_id: string;
  team_id: string;
  user_id: string;
  squad_number: number | null;
  position: string | null;
  is_mercenary: boolean;
  created_at: string;
  player: { display_name: string | null; avatar_url: string | null } | { display_name: string | null; avatar_url: string | null }[] | null;
};

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

  console.log("[referee] invokeFunction auth", functionName, true);

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
    console.log("[referee] invokeFunction error", functionName, message);
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

function normalizeTeamName(value: { name: string | null } | { name: string | null }[] | null): string {
  if (Array.isArray(value)) {
    return value[0]?.name ?? "-";
  }
  return value?.name ?? "-";
}

function normalizePlayer(value: RawRosterRow["player"]): { display_name: string | null; avatar_url: string | null } | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

export async function getMyAvailability(refereeId: string): Promise<RefereeAvailability[]> {
  const today = new Date().toISOString().slice(0, 10);
  const result = await supabase
    .from("referee_availability")
    .select("id, referee_id, available_date, start_time, end_time, province_code, is_booked, created_at")
    .eq("referee_id", refereeId)
    .gte("available_date", today)
    .order("available_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []) as RefereeAvailability[];
}

export async function getAvailableReferees(date: string, startTime: string, provinceCode: string): Promise<RefereeAvailability[]> {
  const availabilityResult = await supabase
    .from("referee_availability")
    .select("id, referee_id, available_date, start_time, end_time, province_code, is_booked, created_at")
    .eq("available_date", date)
    .eq("province_code", provinceCode)
    .eq("is_booked", false)
    .lte("start_time", startTime)
    .gte("end_time", startTime)
    .order("start_time", { ascending: true });

  if (availabilityResult.error) {
    throw new Error(availabilityResult.error.message);
  }

  const availabilities = (availabilityResult.data ?? []) as RefereeAvailability[];
  const refereeIds = Array.from(new Set(availabilities.map((item) => item.referee_id)));

  if (refereeIds.length === 0) {
    return [];
  }

  const [profilesResult, ratingsResult] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url").in("id", refereeIds),
    supabase.from("referee_profiles").select("user_id, average_rating").in("user_id", refereeIds),
  ]);

  if (profilesResult.error) {
    throw new Error(profilesResult.error.message);
  }
  if (ratingsResult.error) {
    throw new Error(ratingsResult.error.message);
  }

  const profileMap = new Map<string, RawProfileRow>((profilesResult.data ?? []).map((row) => [row.id, row as RawProfileRow]));
  const ratingMap = new Map<string, RawRefereeProfileRow>((ratingsResult.data ?? []).map((row) => [row.user_id, row as RawRefereeProfileRow]));

  return availabilities.map((item) => ({
    ...item,
    referee_name: profileMap.get(item.referee_id)?.display_name ?? undefined,
    referee_avatar_url: profileMap.get(item.referee_id)?.avatar_url ?? null,
    referee_rating: ratingMap.get(item.referee_id)?.average_rating ?? null,
  }));
}

export async function getMatchAssignment(matchId: string): Promise<RefereeAssignment | null> {
  const result = await supabase
    .from("referee_assignments")
    .select("id, match_id, referee_id, requesting_team_id, fee_amount, status, requested_at, responded_at, created_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (result.error) {
    throw new Error(result.error.message);
  }

  const assignment = (result.data ?? null) as RefereeAssignment | null;
  if (!assignment) {
    return null;
  }

  const [profileResult, matchResult, teamResult] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url").eq("id", assignment.referee_id).maybeSingle(),
    supabase.from("matches").select("id, scheduled_at, venue_name, home_team_id, away_team_id, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)").eq("id", assignment.match_id).maybeSingle(),
    supabase.from("teams").select("id, name").eq("id", assignment.requesting_team_id).maybeSingle(),
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }
  if (matchResult.error) {
    throw new Error(matchResult.error.message);
  }
  if (teamResult.error) {
    throw new Error(teamResult.error.message);
  }

  const match = (matchResult.data ?? null) as RawMatchRow | null;
  return {
    ...assignment,
    referee_name: profileResult.data?.display_name ?? undefined,
    referee_avatar_url: profileResult.data?.avatar_url ?? null,
    match_scheduled_at: match?.scheduled_at ?? null,
    home_team_name: match ? normalizeTeamName(match.home_team) : undefined,
    away_team_name: match ? normalizeTeamName(match.away_team) : undefined,
    venue_name: match?.venue_name ?? null,
    requesting_team_name: teamResult.data?.name ?? undefined,
  };
}

export async function getMyAssignments(refereeId: string): Promise<RefereeAssignment[]> {
  const result = await supabase
    .from("referee_assignments")
    .select("id, match_id, referee_id, requesting_team_id, fee_amount, status, requested_at, responded_at, created_at")
    .eq("referee_id", refereeId)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(result.error.message);
  }

  const assignments = (result.data ?? []) as RefereeAssignment[];
  if (assignments.length === 0) {
    return [];
  }

  const matchIds = Array.from(new Set(assignments.map((item) => item.match_id)));
  const teamIds = Array.from(new Set(assignments.map((item) => item.requesting_team_id)));

  const [matchesResult, teamsResult, profileResult] = await Promise.all([
    supabase.from("matches").select("id, scheduled_at, venue_name, home_team_id, away_team_id, home_team:teams!matches_home_team_id_fkey(name), away_team:teams!matches_away_team_id_fkey(name)").in("id", matchIds),
    supabase.from("teams").select("id, name").in("id", teamIds),
    supabase.from("profiles").select("id, display_name, avatar_url").eq("id", refereeId).maybeSingle(),
  ]);

  if (matchesResult.error) {
    throw new Error(matchesResult.error.message);
  }
  if (teamsResult.error) {
    throw new Error(teamsResult.error.message);
  }
  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }

  const matchMap = new Map<string, RawMatchRow>(((matchesResult.data ?? []) as RawMatchRow[]).map((row) => [row.id, row]));
  const teamMap = new Map<string, { id: string; name: string | null }>(((teamsResult.data ?? []) as { id: string; name: string | null }[]).map((row) => [row.id, row]));

  return assignments.map((assignment) => {
    const match = matchMap.get(assignment.match_id) ?? null;
    return {
      ...assignment,
      referee_name: profileResult.data?.display_name ?? undefined,
      referee_avatar_url: profileResult.data?.avatar_url ?? null,
      match_scheduled_at: match?.scheduled_at ?? null,
      home_team_name: match ? normalizeTeamName(match.home_team) : undefined,
      away_team_name: match ? normalizeTeamName(match.away_team) : undefined,
      venue_name: match?.venue_name ?? null,
      requesting_team_name: teamMap.get(assignment.requesting_team_id)?.name ?? undefined,
    };
  });
}

export async function getMatchRosters(matchId: string): Promise<MatchRoster[]> {
  const result = await supabase
    .from("match_rosters")
    .select("id, match_id, team_id, user_id, squad_number, position, is_mercenary, created_at, player:profiles!match_rosters_user_id_fkey(display_name, avatar_url)")
    .eq("match_id", matchId)
    .order("team_id", { ascending: true })
    .order("squad_number", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return ((result.data ?? []) as RawRosterRow[]).map((row) => {
    const player = normalizePlayer(row.player);
    return {
      id: row.id,
      match_id: row.match_id,
      team_id: row.team_id,
      user_id: row.user_id,
      squad_number: row.squad_number,
      position: row.position,
      is_mercenary: row.is_mercenary,
      created_at: row.created_at,
      player_name: player?.display_name ?? undefined,
      player_avatar_url: player?.avatar_url ?? null,
    };
  });
}

export async function getRefereeRatings(matchId: string): Promise<RefereeRating[]> {
  const result = await supabase
    .from("referee_ratings")
    .select("id, match_id, assignment_id, rated_by, score_fairness, score_accuracy, score_attitude, overall_score, comment, created_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []) as RefereeRating[];
}

export async function registerAvailability(request: RegisterAvailabilityRequest): Promise<RefereeAvailability> {
  const response = await invokeFunction<RegisterAvailabilityApiResponse>("register-referee-availability", request);
  return assertSuccess(response, "Referee availability returned no data.");
}

export async function requestAssignment(request: RequestAssignmentRequest): Promise<RefereeAssignment> {
  const response = await invokeFunction<RequestAssignmentApiResponse>("request-referee-assignment", request);
  return assertSuccess(response, "Referee assignment returned no data.");
}

export async function respondAssignment(request: RespondAssignmentRequest): Promise<RefereeAssignment> {
  const response = await invokeFunction<RespondAssignmentApiResponse>("respond-referee-assignment", request);
  return assertSuccess(response, "Referee assignment response returned no data.");
}

export async function submitMatchRoster(request: SubmitRosterRequest): Promise<MatchRoster[]> {
  const response = await invokeFunction<SubmitRosterApiResponse>("submit-match-roster", request);
  return assertSuccess(response, "Match roster submission returned no data.");
}

export async function confirmMatchRoster(request: ConfirmRosterRequest): Promise<{ match_id: string; status: string }> {
  const response = await invokeFunction<ConfirmRosterApiResponse>("confirm-match-roster", request);
  return assertSuccess(response, "Match roster confirmation returned no data.");
}

export async function recordRefereePayment(request: RecordPaymentRequest): Promise<RefereePaymentRecord> {
  const response = await invokeFunction<RecordPaymentApiResponse>("record-referee-payment", request);
  return assertSuccess(response, "Referee payment record returned no data.");
}

export async function rateReferee(request: RateRefereeRequest): Promise<RefereeRating> {
  const response = await invokeFunction<RateRefereeApiResponse>("rate-referee", request);
  return assertSuccess(response, "Referee rating returned no data.");
}

export async function deleteAvailability(request: { availabilityId: string }): Promise<void> {
  const result = await supabase.from("referee_availability").delete().eq("id", request.availabilityId);
  if (result.error) {
    throw new Error(result.error.message);
  }
}
