import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, successResponse } from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type MatchLookup = {
  id: string;
  home_team_id: string;
  scheduled_at: string;
};

type TeamLookup = {
  id: string;
  province_code: string | null;
};

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  if (!isObjectRecord(body)) {
    throw new Error("Request body must be a JSON object.");
  }
  return body;
}

function readFeeAmount(body: Record<string, unknown>): number {
  const raw = body.fee_amount;
  const value = typeof raw === "number" ? Math.trunc(raw) : typeof raw === "string" ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("fee_amount must be zero or greater.");
  }
  return value;
}

function getDateKey(value: string): string {
  return value.slice(0, 10);
}

function getTimeKey(value: string): string {
  return value.slice(11, 16);
}

async function getMatch(client: ReturnType<typeof createServiceRoleClient>, matchId: string): Promise<MatchLookup> {
  const { data, error } = await client
    .from("matches")
    .select("id, home_team_id, scheduled_at")
    .eq("id", matchId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("MATCH_NOT_FOUND");
  }

  return data as MatchLookup;
}

async function assertManagerRole(client: ReturnType<typeof createServiceRoleClient>, teamId: string, userId: string): Promise<void> {
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

async function getTeam(client: ReturnType<typeof createServiceRoleClient>, teamId: string): Promise<TeamLookup> {
  const { data, error } = await client
    .from("teams")
    .select("id, province_code")
    .eq("id", teamId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("TEAM_NOT_FOUND");
  }

  return data as TeamLookup;
}

async function getAvailabilitySlot(
  client: ReturnType<typeof createServiceRoleClient>,
  refereeId: string,
  availableDate: string,
  provinceCode: string,
  matchTime: string,
) {
  const { data, error } = await client
    .from("referee_availability")
    .select("id, is_booked, start_time, end_time")
    .eq("referee_id", refereeId)
    .eq("available_date", availableDate)
    .eq("province_code", provinceCode)
    .eq("is_booked", false)
    .lte("start_time", matchTime)
    .gte("end_time", matchTime)
    .order("start_time", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("REFEREE_NOT_AVAILABLE");
  }

  return data;
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

    const matchId = readRequiredString(body, "match_id");
    const refereeId = readRequiredString(body, "referee_id");
    const feeAmount = readFeeAmount(body);

    const match = await getMatch(serviceClient, matchId);
    await assertManagerRole(serviceClient, match.home_team_id, user.id);
    const team = await getTeam(serviceClient, match.home_team_id);

    const availableDate = getDateKey(match.scheduled_at);
    const matchTime = getTimeKey(match.scheduled_at);
    const availability = await getAvailabilitySlot(serviceClient, refereeId, availableDate, team.province_code ?? "", matchTime);

    const { data, error } = await serviceClient
      .from("referee_assignments")
      .insert({
        match_id: matchId,
        referee_id: refereeId,
        requesting_team_id: match.home_team_id,
        fee_amount: feeAmount,
        status: "pending",
      })
      .select("id, match_id, referee_id, requesting_team_id, fee_amount, status, requested_at, responded_at, created_at")
      .single();

    if (error || !data) {
      if (error?.code === "23505") {
        return errorResponse("REFEREE_ALREADY_ASSIGNED", "REFEREE_ALREADY_ASSIGNED", 409);
      }
      return errorResponse("request_referee_assignment_failed", error?.message ?? "Failed to request referee assignment.", 400);
    }

    const updateResult = await serviceClient
      .from("referee_availability")
      .update({ is_booked: true })
      .eq("id", availability.id);

    if (updateResult.error) {
      return errorResponse("request_referee_assignment_failed", updateResult.error.message, 400);
    }

    return successResponse(data, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to request referee assignment.";
    const status = message === "NOT_MANAGER" ? 403 : message === "REFEREE_ALREADY_ASSIGNED" ? 409 : 400;
    const code = ["NOT_MANAGER", "MATCH_NOT_FOUND", "TEAM_NOT_FOUND", "REFEREE_NOT_AVAILABLE", "REFEREE_ALREADY_ASSIGNED"].includes(message)
      ? message
      : "request_referee_assignment_failed";
    return errorResponse(code, message, status);
  }
});