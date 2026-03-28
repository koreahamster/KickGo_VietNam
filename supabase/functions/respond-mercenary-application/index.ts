import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, successResponse } from "../_shared/http.ts";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);
  if (!isObjectRecord(body)) {
    throw new Error("Request body must be a JSON object.");
  }
  return body;
}

function readRequiredString(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required.`);
  }
  return value.trim();
}

function readDecision(body: Record<string, unknown>): "accept" | "reject" {
  const value = body.decision;
  if (value === "accept" || value === "reject") {
    return value;
  }
  throw new Error("decision must be accept or reject.");
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
    const applicationId = readRequiredString(body, "application_id");
    const decision = readDecision(body);

    const { data: application, error: applicationError } = await serviceClient
      .from("mercenary_applications")
      .select("id, post_id, applicant_id, message, status, created_at, post:mercenary_posts!mercenary_applications_post_id_fkey(id, team_id, needed_count, status)")
      .eq("id", applicationId)
      .maybeSingle();

    if (applicationError || !application) {
      return errorResponse("mercenary_application_not_found", applicationError?.message ?? "Application was not found.", 404);
    }

    const post = Array.isArray(application.post) ? application.post[0] ?? null : application.post;
    if (!post) {
      return errorResponse("mercenary_post_not_found", "Mercenary post was not found.", 404);
    }

    await assertManagerRole(serviceClient, post.team_id, user.id);

    const nextStatus = decision === "accept" ? "accepted" : "rejected";

    const { data, error } = await serviceClient
      .from("mercenary_applications")
      .update({ status: nextStatus })
      .eq("id", applicationId)
      .select("id, post_id, applicant_id, message, status, created_at")
      .single();

    if (error || !data) {
      return errorResponse("respond_mercenary_application_failed", error?.message ?? "Failed to update application.", 400);
    }

    if (decision === "accept") {
      const { count, error: countError } = await serviceClient
        .from("mercenary_applications")
        .select("id", { count: "exact", head: true })
        .eq("post_id", post.id)
        .eq("status", "accepted");

      if (!countError && typeof count === "number" && count >= Number(post.needed_count ?? 0)) {
        await serviceClient.from("mercenary_posts").update({ status: "closed" }).eq("id", post.id);
      }
    }

    return successResponse(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to respond mercenary application.";
    const status = message === "NOT_MANAGER" ? 403 : 400;
    const code = message === "NOT_MANAGER" ? "NOT_MANAGER" : "respond_mercenary_application_failed";
    return errorResponse(code, message, status);
  }
});