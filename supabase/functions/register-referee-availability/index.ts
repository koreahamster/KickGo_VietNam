import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, successResponse } from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";

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

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function isValidTime(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value);
}

function compareTime(left: string, right: string): number {
  return left.localeCompare(right);
}

async function assertRefereeProfile(client: ReturnType<typeof createServiceRoleClient>, userId: string): Promise<void> {
  const { data, error } = await client
    .from("referee_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("REFEREE_PROFILE_REQUIRED");
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

    const availableDate = readRequiredString(body, "available_date");
    const startTime = readRequiredString(body, "start_time");
    const endTime = readRequiredString(body, "end_time");
    const provinceCode = readRequiredString(body, "province_code");

    if (!isValidDate(availableDate)) {
      throw new Error("INVALID_DATE");
    }

    if (!isValidTime(startTime) || !isValidTime(endTime) || compareTime(startTime, endTime) >= 0) {
      throw new Error("INVALID_TIME_RANGE");
    }

    const today = new Date();
    const todayKey = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`;
    if (availableDate < todayKey) {
      throw new Error("INVALID_DATE");
    }

    await assertRefereeProfile(serviceClient, user.id);

    const { data, error } = await serviceClient
      .from("referee_availability")
      .upsert(
        {
          referee_id: user.id,
          available_date: availableDate,
          start_time: startTime,
          end_time: endTime,
          province_code: provinceCode,
        },
        { onConflict: "referee_id,available_date,start_time" },
      )
      .select("id, referee_id, available_date, start_time, end_time, province_code, is_booked, created_at")
      .single();

    if (error || !data) {
      return errorResponse("register_referee_availability_failed", error?.message ?? "Failed to register referee availability.", 400);
    }

    return successResponse(data, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to register referee availability.";
    const status = message === "REFEREE_PROFILE_REQUIRED" ? 403 : message === "INVALID_DATE" || message === "INVALID_TIME_RANGE" ? 400 : 400;
    const code = message === "REFEREE_PROFILE_REQUIRED"
      ? "REFEREE_PROFILE_REQUIRED"
      : message === "INVALID_DATE"
        ? "INVALID_DATE"
        : message === "INVALID_TIME_RANGE"
          ? "INVALID_TIME_RANGE"
          : "register_referee_availability_failed";
    return errorResponse(code, message, status);
  }
});