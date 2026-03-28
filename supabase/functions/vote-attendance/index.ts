import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, successResponse } from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";

type AttendanceResponse = "yes" | "no" | "maybe";

type AttendanceVoteRow = {
  id: string;
  poll_id: string;
  user_id: string;
  response: AttendanceResponse;
  responded_at: string | null;
  created_at: string;
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

function assertResponse(value: string): AttendanceResponse {
  if (value === "yes" || value === "no" || value === "maybe") {
    return value;
  }
  throw new Error("response must be yes, no, or maybe.");
}

async function assertPollMembership(
  client: ReturnType<typeof createServiceRoleClient>,
  pollId: string,
  userId: string,
): Promise<{ team_id: string }> {
  const { data, error } = await client
    .from("attendance_polls")
    .select("team_id")
    .eq("id", pollId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("POLL_NOT_FOUND");
  }

  const { data: membership, error: membershipError } = await client
    .from("team_members")
    .select("id")
    .eq("team_id", data.team_id)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!membership) {
    throw new Error("NOT_TEAM_MEMBER");
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

    const pollId = readRequiredString(body, "poll_id");
    const response = assertResponse(readRequiredString(body, "response"));

    await assertPollMembership(serviceClient, pollId, user.id);

    const now = new Date().toISOString();
    const { data, error } = await serviceClient
      .from("attendance_votes")
      .upsert(
        {
          poll_id: pollId,
          user_id: user.id,
          response,
          responded_at: now,
        },
        { onConflict: "poll_id,user_id" },
      )
      .select("id, poll_id, user_id, response, responded_at, created_at")
      .single<AttendanceVoteRow>();

    if (error || !data) {
      return errorResponse("vote_attendance_failed", error?.message ?? "Failed to vote attendance.", 400);
    }

    return successResponse(data, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to vote attendance.";
    const status = message === "NOT_TEAM_MEMBER" ? 403 : message === "POLL_NOT_FOUND" ? 404 : 400;
    const code = message === "NOT_TEAM_MEMBER" ? "NOT_TEAM_MEMBER" : message === "POLL_NOT_FOUND" ? "POLL_NOT_FOUND" : "vote_attendance_failed";
    return errorResponse(code, message, status);
  }
});