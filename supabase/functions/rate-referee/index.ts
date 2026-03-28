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

function readScore(body: Record<string, unknown>, key: string): number {
  const value = typeof body[key] === "number" ? Math.trunc(body[key] as number) : typeof body[key] === "string" ? Number.parseInt(body[key] as string, 10) : Number.NaN;
  if (!Number.isFinite(value) || value < 1 || value > 5) {
    throw new Error("INVALID_SCORE");
  }
  return value;
}

async function getAssignment(client: ReturnType<typeof createServiceRoleClient>, assignmentId: string) {
  const { data, error } = await client
    .from("referee_assignments")
    .select("id, match_id")
    .eq("id", assignmentId)
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

async function assertMatchManager(client: ReturnType<typeof createServiceRoleClient>, match: { home_team_id: string; away_team_id: string | null }, userId: string): Promise<void> {
  const teamIds = match.away_team_id ? [match.home_team_id, match.away_team_id] : [match.home_team_id];
  const { data, error } = await client
    .from("team_members")
    .select("team_id, role")
    .in("team_id", teamIds)
    .eq("user_id", userId)
    .eq("status", "active");

  if (error) {
    throw new Error(error.message);
  }

  const isManager = (data ?? []).some((item) => item.role === "owner" || item.role === "manager");
  if (!isManager) {
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

    const matchId = readRequiredString(body, "match_id");
    const assignmentId = readRequiredString(body, "assignment_id");
    const scoreFairness = readScore(body, "score_fairness");
    const scoreAccuracy = readScore(body, "score_accuracy");
    const scoreAttitude = readScore(body, "score_attitude");
    const overallScore = readScore(body, "overall_score");
    const comment = typeof body.comment === "string" && body.comment.trim() ? body.comment.trim() : null;

    const assignment = await getAssignment(serviceClient, assignmentId);
    if (assignment.match_id !== matchId) {
      throw new Error("ASSIGNMENT_MISMATCH");
    }

    const match = await getMatch(serviceClient, matchId);
    await assertMatchManager(serviceClient, match, user.id);

    if (match.status !== "finalized" && match.status !== "auto_finalized") {
      throw new Error("MATCH_NOT_FINALIZED");
    }

    const { data, error } = await serviceClient
      .from("referee_ratings")
      .insert({
        match_id: matchId,
        assignment_id: assignmentId,
        rated_by: user.id,
        score_fairness: scoreFairness,
        score_accuracy: scoreAccuracy,
        score_attitude: scoreAttitude,
        overall_score: overallScore,
        comment,
      })
      .select("id, match_id, assignment_id, rated_by, score_fairness, score_accuracy, score_attitude, overall_score, comment, created_at")
      .single();

    if (error || !data) {
      if (error?.code === "23505") {
        return errorResponse("VOTE_ALREADY_SUBMITTED", "VOTE_ALREADY_SUBMITTED", 409);
      }
      return errorResponse("rate_referee_failed", error?.message ?? "Failed to rate referee.", 400);
    }

    return successResponse(data, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to rate referee.";
    const code = ["ASSIGNMENT_NOT_FOUND", "MATCH_NOT_FOUND", "NOT_MANAGER", "MATCH_NOT_FINALIZED", "INVALID_SCORE", "ASSIGNMENT_MISMATCH"].includes(message)
      ? message
      : "rate_referee_failed";
    const status = message === "NOT_MANAGER" ? 403 : message === "ASSIGNMENT_NOT_FOUND" || message === "MATCH_NOT_FOUND" ? 404 : 400;
    return errorResponse(code, message, status);
  }
});
