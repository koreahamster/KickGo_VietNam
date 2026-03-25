import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";
import { readOptionalString, readRequiredString } from "../_shared/validation.ts";

type MatchSportType = "soccer" | "futsal";
type MatchType = "friendly" | "league" | "tournament";
type MatchSide = "home" | "away";
type MatchDeadlineOption = "24h" | "12h" | "0h";

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

function assertNotice(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  if (value.length > 1000) {
    throw new Error("notice must be 1000 characters or fewer.");
  }

  return value;
}

function assertShortText(value: string | undefined, name: string, maxLength: number): string | null {
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
  const deadlineTime = scheduledTime - offsetHours * 60 * 60 * 1000;

  return new Date(deadlineTime).toISOString();
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
    const body = await parseJsonBody(request);

    const teamId = readRequiredString(body, "team_id");
    const scheduledAt = assertScheduledAt(readRequiredString(body, "scheduled_at"));
    const sportType = assertSportType(readRequiredString(body, "sport_type"));
    const matchType = assertMatchType(readOptionalString(body, "match_type") ?? undefined);
    const side = assertMatchSide(readOptionalString(body, "side") ?? undefined);
    const deadlineOption = assertDeadlineOption(readOptionalString(body, "deadline_option") ?? undefined);
    const quarterCount = assertIntegerRange(body.quarter_count, "quarter_count", 1, 8, 2);
    const quarterMinutes = assertIntegerRange(body.quarter_minutes, "quarter_minutes", 1, 90, 25);
    const venueName = assertShortText(readOptionalString(body, "venue_name") ?? undefined, "venue_name", 120);
    const opponentName = assertShortText(readOptionalString(body, "opponent_name") ?? undefined, "opponent_name", 80);
    const notice = assertNotice(readOptionalString(body, "notice") ?? undefined);
    const attendanceDeadlineAt = getAttendanceDeadline(scheduledAt, deadlineOption);

    const { data: membership, error: membershipError } = await serviceClient
      .from("team_members")
      .select("id, role, status")
      .eq("team_id", teamId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membershipError) {
      console.error("[create-match] team_membership_lookup_failed", membershipError);
      return errorResponse("team_membership_lookup_failed", membershipError.message, 400);
    }

    if (!membership || membership.status !== "active" || (membership.role !== "owner" && membership.role !== "manager")) {
      return errorResponse("team_operator_required", "Only active team owners or managers can create matches.", 403);
    }

    const matchPayload = {
      home_team_id: teamId,
      away_team_id: null,
      scheduled_at: scheduledAt,
      venue_name: venueName,
      sport_type: sportType,
      match_type: matchType,
      status: "scheduled",
      opponent_name: opponentName,
      team_side: side,
      quarter_count: quarterCount,
      quarter_minutes: quarterMinutes,
      attendance_deadline_at: attendanceDeadlineAt,
      notice,
    };

    const { data: match, error: matchInsertError } = await serviceClient
      .from("matches")
      .insert(matchPayload)
      .select("id, status")
      .single();

    if (matchInsertError) {
      console.error("[create-match] match_insert_failed", matchInsertError);
      return errorResponse("match_insert_failed", matchInsertError.message, 400);
    }

    const { data: attendancePoll, error: attendancePollError } = await serviceClient
      .from("attendance_polls")
      .insert({
        match_id: match.id,
        team_id: teamId,
        deadline_at: attendanceDeadlineAt,
      })
      .select("id")
      .single();

    if (attendancePollError) {
      console.error("[create-match] attendance_poll_insert_failed", attendancePollError);
      const { error: rollbackError } = await serviceClient.from("matches").delete().eq("id", match.id);

      if (rollbackError) {
        console.error("[create-match] rollback_failed", rollbackError);
      }

      return errorResponse("attendance_poll_insert_failed", attendancePollError.message, 400);
    }

    return successResponse(
      {
        match_id: match.id,
        attendance_poll_id: attendancePoll.id,
        status: match.status,
      },
      201,
    );
  } catch (error: unknown) {
    console.error("[create-match] unexpected_failure", error);
    return errorResponse(
      "create_match_failed",
      error instanceof Error ? error.message : "Failed to create match.",
      400,
    );
  }
});