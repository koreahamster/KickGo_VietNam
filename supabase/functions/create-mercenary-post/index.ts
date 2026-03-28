import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, successResponse } from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";

const ALLOWED_POSITIONS = new Set(["GK", "CB", "LB", "RB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST"]);

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

function readNeededPositions(body: Record<string, unknown>): string[] {
  const value = body.needed_positions;
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("needed_positions must be a non-empty array.");
  }

  return Array.from(new Set(value.map((item) => {
    if (typeof item !== "string") {
      throw new Error("needed_positions contains an invalid value.");
    }
    const trimmed = item.trim();
    if (!ALLOWED_POSITIONS.has(trimmed)) {
      throw new Error("needed_positions contains an invalid position.");
    }
    return trimmed;
  })));
}

function readNeededCount(body: Record<string, unknown>): number {
  const raw = body.needed_count;
  const parsed = typeof raw === "number" ? Math.trunc(raw) : typeof raw === "string" ? Number.parseInt(raw, 10) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 11) {
    throw new Error("needed_count must be between 1 and 11.");
  }
  return parsed;
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

    const teamId = readRequiredString(body, "team_id");
    const matchId = readNullableString(body, "match_id");
    const provinceCode = readRequiredString(body, "province_code");
    const neededPositions = readNeededPositions(body);
    const neededCount = readNeededCount(body);
    const description = readNullableString(body, "description");

    await assertManagerRole(serviceClient, teamId, user.id);

    const { data, error } = await serviceClient
      .from("mercenary_posts")
      .insert({
        team_id: teamId,
        match_id: matchId,
        needed_positions: neededPositions,
        needed_count: neededCount,
        province_code: provinceCode,
        description,
        status: "open",
        created_by: user.id,
      })
      .select("id, team_id, match_id, needed_positions, needed_count, province_code, description, status, created_by, created_at, updated_at")
      .single();

    if (error || !data) {
      return errorResponse("create_mercenary_post_failed", error?.message ?? "Failed to create mercenary post.", 400);
    }

    return successResponse(data, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create mercenary post.";
    const status = message === "NOT_MANAGER" ? 403 : 400;
    const code = message === "NOT_MANAGER" ? "NOT_MANAGER" : "create_mercenary_post_failed";
    return errorResponse(code, message, status);
  }
});