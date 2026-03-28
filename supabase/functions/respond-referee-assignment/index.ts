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

async function getAssignment(client: ReturnType<typeof createServiceRoleClient>, assignmentId: string) {
  const { data, error } = await client
    .from("referee_assignments")
    .select("id, match_id, referee_id, status")
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
    .select("id, scheduled_at")
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
    const assignmentId = readRequiredString(body, "assignment_id");
    const decision = readRequiredString(body, "decision");

    if (decision !== "accept" && decision !== "reject") {
      throw new Error("INVALID_DECISION");
    }

    const assignment = await getAssignment(serviceClient, assignmentId);
    if (assignment.referee_id !== user.id) {
      throw new Error("NOT_ASSIGNED_REFEREE");
    }

    const match = await getMatch(serviceClient, assignment.match_id);
    const respondedAt = new Date().toISOString();

    if (decision === "accept") {
      const { data, error } = await serviceClient
        .from("referee_assignments")
        .update({ status: "accepted", responded_at: respondedAt })
        .eq("id", assignmentId)
        .select("id, match_id, referee_id, requesting_team_id, fee_amount, status, requested_at, responded_at, created_at")
        .single();

      if (error || !data) {
        return errorResponse("respond_referee_assignment_failed", error?.message ?? "Failed to accept assignment.", 400);
      }

      const matchUpdate = await serviceClient
        .from("matches")
        .update({ referee_id: assignment.referee_id, updated_at: respondedAt })
        .eq("id", assignment.match_id);

      if (matchUpdate.error) {
        return errorResponse("respond_referee_assignment_failed", matchUpdate.error.message, 400);
      }

      return successResponse(data, 200);
    }

    const { data, error } = await serviceClient
      .from("referee_assignments")
      .update({ status: "rejected", responded_at: respondedAt })
      .eq("id", assignmentId)
      .select("id, match_id, referee_id, requesting_team_id, fee_amount, status, requested_at, responded_at, created_at")
      .single();

    if (error || !data) {
      return errorResponse("respond_referee_assignment_failed", error?.message ?? "Failed to reject assignment.", 400);
    }

    const dateKey = match.scheduled_at.slice(0, 10);
    const timeKey = match.scheduled_at.slice(11, 16);
    const availabilityUpdate = await serviceClient
      .from("referee_availability")
      .update({ is_booked: false })
      .eq("referee_id", assignment.referee_id)
      .eq("available_date", dateKey)
      .eq("is_booked", true)
      .lte("start_time", timeKey)
      .gte("end_time", timeKey);

    if (availabilityUpdate.error) {
      return errorResponse("respond_referee_assignment_failed", availabilityUpdate.error.message, 400);
    }

    return successResponse(data, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to respond to referee assignment.";
    const code = ["ASSIGNMENT_NOT_FOUND", "MATCH_NOT_FOUND", "NOT_ASSIGNED_REFEREE", "INVALID_DECISION"].includes(message)
      ? message
      : "respond_referee_assignment_failed";
    const status = message === "NOT_ASSIGNED_REFEREE" ? 403 : message === "ASSIGNMENT_NOT_FOUND" || message === "MATCH_NOT_FOUND" ? 404 : 400;
    return errorResponse(code, message, status);
  }
});
