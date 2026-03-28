import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";

const ALLOWED_DECISIONS = ["accepted", "rejected"] as const;
type Decision = (typeof ALLOWED_DECISIONS)[number];

type ApplicationRow = {
  id: string;
  post_id: string;
  applicant_id: string;
  message: string;
  status: string;
  created_at: string;
  post: { id: string; team_id: string } | { id: string; team_id: string }[] | null;
  applicant: { display_name: string | null; avatar_url: string | null } | { display_name: string | null; avatar_url: string | null }[] | null;
};

function readRequestBody(body: unknown): { applicationId: string; decision: Decision } {
  if (!body || typeof body !== "object") {
    throw new Error("request body must be an object.");
  }

  const record = body as Record<string, unknown>;
  const applicationId = typeof record.application_id === "string" ? record.application_id.trim() : "";
  const decision = typeof record.decision === "string" ? record.decision.trim() : "";

  if (!applicationId) {
    throw new Error("application_id is required.");
  }

  if (!ALLOWED_DECISIONS.includes(decision as Decision)) {
    throw new Error("decision is invalid.");
  }

  return { applicationId, decision: decision as Decision };
}

function normalizeOne<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
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
    const { applicationId, decision } = readRequestBody(body);

    const { data: applicationData, error: applicationError } = await serviceClient
      .from("team_recruitment_applications")
      .select(`
        id,
        post_id,
        applicant_id,
        message,
        status,
        created_at,
        post:team_recruitment_posts!inner(id, team_id),
        applicant:profiles!team_recruitment_applications_applicant_id_fkey(display_name, avatar_url)
      `)
      .eq("id", applicationId)
      .single();

    if (applicationError) {
      return errorResponse("application_lookup_failed", applicationError.message, 400);
    }

    const application = applicationData as ApplicationRow;
    const post = normalizeOne(application.post);

    if (!post?.team_id) {
      return errorResponse("post_not_found", "Recruitment post was not found.", 404);
    }

    const { data: membership, error: membershipError } = await serviceClient
      .from("team_members")
      .select("role")
      .eq("team_id", post.team_id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError) {
      return errorResponse("membership_lookup_failed", membershipError.message, 400);
    }

    if (!membership || !["owner", "manager"].includes(membership.role)) {
      return errorResponse("NOT_MANAGER", "Manager permission is required.", 403);
    }

    if (application.status !== "pending") {
      return errorResponse("application_not_pending", "Application is already resolved.", 400);
    }

    if (decision === "accepted") {
      const { data: existingMember, error: existingMemberError } = await serviceClient
        .from("team_members")
        .select("id")
        .eq("team_id", post.team_id)
        .eq("user_id", application.applicant_id)
        .order("joined_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingMemberError) {
        return errorResponse("member_lookup_failed", existingMemberError.message, 400);
      }

      if (existingMember?.id) {
        const { error: memberUpdateError } = await serviceClient
          .from("team_members")
          .update({
            role: "player",
            status: "active",
            joined_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingMember.id);

        if (memberUpdateError) {
          return errorResponse("member_update_failed", memberUpdateError.message, 400);
        }
      } else {
        const { error: memberInsertError } = await serviceClient.from("team_members").insert({
          team_id: post.team_id,
          user_id: application.applicant_id,
          role: "player",
          status: "active",
          joined_at: new Date().toISOString(),
        });

        if (memberInsertError) {
          return errorResponse("member_insert_failed", memberInsertError.message, 400);
        }
      }
    }

    const { data: updatedApplicationData, error: updateError } = await serviceClient
      .from("team_recruitment_applications")
      .update({
        status: decision,
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId)
      .select(`
        id,
        post_id,
        applicant_id,
        message,
        status,
        created_at,
        applicant:profiles!team_recruitment_applications_applicant_id_fkey(display_name, avatar_url)
      `)
      .single();

    if (updateError) {
      return errorResponse("application_update_failed", updateError.message, 400);
    }

    const updatedApplication = updatedApplicationData as Omit<ApplicationRow, "post">;
    const applicant = normalizeOne(updatedApplication.applicant);

    return successResponse(
      {
        id: updatedApplication.id,
        post_id: updatedApplication.post_id,
        applicant_id: updatedApplication.applicant_id,
        applicant_name: applicant?.display_name ?? "Applicant",
        applicant_avatar_url: applicant?.avatar_url ?? null,
        message: updatedApplication.message,
        status: updatedApplication.status,
        created_at: updatedApplication.created_at,
      },
      200,
    );
  } catch (error: unknown) {
    return errorResponse(
      "respond_team_recruitment_application_failed",
      error instanceof Error ? error.message : "Failed to respond to recruitment application.",
      400,
    );
  }
});