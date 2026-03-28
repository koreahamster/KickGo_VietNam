import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, successResponse } from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  if (!isObjectRecord(body)) {
    throw new Error("INVALID_BODY");
  }
  return body;
}

async function getAssignment(client: ReturnType<typeof createServiceRoleClient>, matchId: string) {
  const { data, error } = await client
    .from("referee_assignments")
    .select("id, referee_id, status")
    .eq("match_id", matchId)
    .eq("status", "accepted")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("ASSIGNMENT_NOT_FOUND");
  }
  return data;
}

async function getMatch(client: ReturnType<typeof createServiceRoleClient>, matchId: string) {
  const { data, error } = await client
    .from("matches")
    .select("id, home_team_id, away_team_id, status")
    .eq("id", matchId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("MATCH_NOT_FOUND");
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

    const match = await getMatch(serviceClient, matchId);
    const assignment = await getAssignment(serviceClient, matchId);
    if (assignment.referee_id !== user.id) {
      throw new Error("NOT_ASSIGNED_REFEREE");
    }

    const { data: rosters, error: rosterError } = await serviceClient
      .from("match_rosters")
      .select("team_id")
      .eq("match_id", matchId);

    if (rosterError) {
      return errorResponse("confirm_match_roster_failed", rosterError.message, 400);
    }

    const submittedTeams = new Set((rosters ?? []).map((item) => item.team_id));
    if (!submittedTeams.has(match.home_team_id)) {
      throw new Error("ROSTER_NOT_SUBMITTED");
    }
    if (match.away_team_id && !submittedTeams.has(match.away_team_id)) {
      throw new Error("ROSTER_NOT_SUBMITTED");
    }

    const { data, error } = await serviceClient
      .from("matches")
      .update({ status: "ongoing", updated_at: new Date().toISOString() })
      .eq("id", matchId)
      .select("id, status")
      .single();

    if (error || !data) {
      return errorResponse("confirm_match_roster_failed", error?.message ?? "Failed to confirm roster.", 400);
    }

    return successResponse({ match_id: data.id, status: data.status }, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to confirm roster.";
    const code = ["MATCH_NOT_FOUND", "ASSIGNMENT_NOT_FOUND", "NOT_ASSIGNED_REFEREE", "ROSTER_NOT_SUBMITTED"].includes(message)
      ? message
      : "confirm_match_roster_failed";
    const status = message === "NOT_ASSIGNED_REFEREE" ? 403 : message === "MATCH_NOT_FOUND" || message === "ASSIGNMENT_NOT_FOUND" ? 404 : 400;
    return errorResponse(code, message, status);
  }
});

