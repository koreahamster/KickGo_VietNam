import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, successResponse } from "../_shared/http.ts";
import { readOptionalString, readRequiredString } from "../_shared/validation.ts";

type MatchSportType = "soccer" | "futsal";
type MatchType = "friendly" | "league" | "tournament";
type MatchSide = "home" | "away";
type MatchDeadlineOption = "24h" | "12h" | "0h";

type MatchRow = {
  id: string;
  home_team_id: string;
  away_team_id: string | null;
  scheduled_at: string;
  venue_name: string | null;
  sport_type: MatchSportType;
  match_type: MatchType;
  status: string;
  home_score: number | null;
  away_score: number | null;
  tier_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  opponent_name: string | null;
  team_side: MatchSide;
  quarter_count: number;
  quarter_minutes: number;
  attendance_deadline_at: string | null;
  notice: string | null;
};

function parseBody(request: Request): Promise<Record<string, unknown>> {
  return request.json().then((body) => {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Request body must be a JSON object.");
    }
    return body as Record<string, unknown>;
  }).catch(() => {
    throw new Error("Request body must be valid JSON.");
  });
}

function readNullableString(body: Record<string, unknown>, key: string): string | null {
  const value = body[key];
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error(`${key} must be a string or null.`);
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function assertSportType(value: string): MatchSportType {
  if (value === "soccer" || value === "futsal") {
    return value;
  }
  throw new Error("sport_type must be soccer or futsal.");
}

function assertMatchType(value: string | undefined): MatchType {
  if (!value) {
    return "friendly";
  }
  if (value === "friendly" || value === "league" || value === "tournament") {
    return value;
  }
  throw new Error("match_type must be friendly, league, or tournament.");
}

function assertMatchSide(value: string | undefined): MatchSide {
  if (!value) {
    return "home";
  }
  if (value === "home" || value === "away") {
    return value;
  }
  throw new Error("side must be home or away.");
}

function assertDeadlineOption(value: string | undefined): MatchDeadlineOption {
  if (!value) {
    return "0h";
  }
  if (value === "24h" || value === "12h" || value === "0h") {
    return value;
  }
  throw new Error("deadline_option must be 24h, 12h, or 0h.");
}

function assertScheduledAt(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("scheduled_at must be a valid date-time string.");
  }
  return parsed.toISOString();
}

function assertIntegerRange(value: unknown, name: string, min: number, max: number, fallback: number): number {
  const parsed = typeof value === "number"
    ? Math.trunc(value)
    : typeof value === "string"
    ? Number.parseInt(value, 10)
    : fallback;

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be between ${min} and ${max}.`);
  }

  return parsed;
}

function assertShortText(value: string | null, name: string, maxLength: number): string | null {
  if (!value) {
    return null;
  }
  if (value.length > maxLength) {
    throw new Error(`${name} must be ${maxLength} characters or fewer.`);
  }
  return value;
}

function getAttendanceDeadline(scheduledAt: string, deadlineOption: MatchDeadlineOption): string {
  const scheduledTime = new Date(scheduledAt).getTime();
  const offsetHours = deadlineOption === "24h" ? 24 : deadlineOption === "12h" ? 12 : 0;
  return new Date(scheduledTime - offsetHours * 60 * 60 * 1000).toISOString();
}

async function assertManagerRole(
  client: ReturnType<typeof createServiceRoleClient>,
  teamId: string,
  userId: string,
): Promise<void> {
  const { data, error } = await client
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || (data.role !== "owner" && data.role !== "manager")) {
    throw new Error("NOT_MANAGER");
  }
}

Deno.serve(async (request: Request): Promise<Response> => {
  const optionsResponse = handleOptionsRequest(request);
  if (optionsResponse) {
    return optionsResponse;
  }

  if (request.method !== "POST") {
    return errorResponse("method_not_allowed", "POST requests only.", 405);
  }

  try {
    const userClient = createUserClient(request);
    const user = await requireUser(userClient);
    const serviceClient = createServiceRoleClient();
    const body = await parseBody(request);

    const homeTeamId = readNullableString(body, "home_team_id") ?? readNullableString(body, "team_id");
    if (!homeTeamId) {
      return errorResponse("invalid_team_id", "home_team_id is required.", 400);
    }

    const awayTeamId = readNullableString(body, "away_team_id");
    const scheduledAt = assertScheduledAt(readRequiredString(body, "scheduled_at"));
    const sportType = assertSportType(readRequiredString(body, "sport_type"));
    const matchType = assertMatchType(readOptionalString(body, "match_type") ?? undefined);
    const venueName = assertShortText(readNullableString(body, "venue_name"), "venue_name", 120);
    const tierId = readNullableString(body, "tier_id");
    const opponentName = assertShortText(readNullableString(body, "opponent_name"), "opponent_name", 80);
    const side = assertMatchSide(readOptionalString(body, "side") ?? undefined);
    const deadlineOption = assertDeadlineOption(readOptionalString(body, "deadline_option") ?? undefined);
    const quarterCount = assertIntegerRange(body.quarter_count, "quarter_count", 1, 8, 2);
    const quarterMinutes = assertIntegerRange(body.quarter_minutes, "quarter_minutes", 1, 90, 25);
    const notice = assertShortText(readNullableString(body, "notice"), "notice", 1000);
    const attendanceDeadlineAt = getAttendanceDeadline(scheduledAt, deadlineOption);

    await assertManagerRole(serviceClient, homeTeamId, user.id);

    const { data: createdMatch, error: createMatchError } = await serviceClient
      .from("matches")
      .insert({
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        scheduled_at: scheduledAt,
        venue_name: venueName,
        sport_type: sportType,
        match_type: matchType,
        status: "scheduled",
        home_score: null,
        away_score: null,
        tier_id: tierId,
        created_by: user.id,
        updated_at: new Date().toISOString(),
        opponent_name: opponentName,
        team_side: side,
        quarter_count: quarterCount,
        quarter_minutes: quarterMinutes,
        attendance_deadline_at: attendanceDeadlineAt,
        notice,
      })
      .select("id, home_team_id, away_team_id, scheduled_at, venue_name, sport_type, match_type, status, home_score, away_score, tier_id, created_by, created_at, updated_at, opponent_name, team_side, quarter_count, quarter_minutes, attendance_deadline_at, notice")
      .single<MatchRow>();

    if (createMatchError || !createdMatch) {
      return errorResponse("create_match_failed", createMatchError?.message ?? "Failed to create match.", 400);
    }

    const pollPayload = [{
      match_id: createdMatch.id,
      team_id: homeTeamId,
      deadline_at: attendanceDeadlineAt,
    }];

    if (awayTeamId && awayTeamId !== homeTeamId) {
      pollPayload.push({
        match_id: createdMatch.id,
        team_id: awayTeamId,
        deadline_at: attendanceDeadlineAt,
      });
    }

    const { error: pollError } = await serviceClient
      .from("attendance_polls")
      .insert(pollPayload);

    if (pollError) {
      await serviceClient.from("matches").delete().eq("id", createdMatch.id);
      return errorResponse("attendance_poll_insert_failed", pollError.message, 400);
    }

    return successResponse(createdMatch, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create match.";
    const status = message === "NOT_MANAGER" ? 403 : 400;
    const code = message === "NOT_MANAGER" ? "NOT_MANAGER" : "create_match_failed";
    return errorResponse(code, message, status);
  }
});