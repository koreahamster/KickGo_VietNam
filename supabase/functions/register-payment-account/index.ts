import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, parseJsonBody, successResponse } from "../_shared/http.ts";

const ALLOWED_PROVIDERS = ["momo", "zalopay", "bank"] as const;
type Provider = (typeof ALLOWED_PROVIDERS)[number];

type RequestBody = {
  teamId: string;
  provider: Provider;
  accountName: string;
  accountNumber: string | null;
  qrImageUrl: string | null;
};

function readBody(body: Record<string, unknown>): RequestBody {
  const teamId = typeof body.team_id === "string" ? body.team_id.trim() : "";
  const provider = typeof body.provider === "string" ? body.provider.trim() : "";
  const accountName = typeof body.account_name === "string" ? body.account_name.trim() : "";
  const accountNumberRaw = body.account_number;
  const qrImageUrlRaw = body.qr_image_url;

  if (!teamId) {
    throw new Error("team_id is required.");
  }

  if (!ALLOWED_PROVIDERS.includes(provider as Provider)) {
    throw new Error("provider is invalid.");
  }

  if (!accountName) {
    throw new Error("account_name is required.");
  }

  const accountNumber = typeof accountNumberRaw === "string" && accountNumberRaw.trim().length > 0
    ? accountNumberRaw.trim()
    : null;
  const qrImageUrl = typeof qrImageUrlRaw === "string" && qrImageUrlRaw.trim().length > 0
    ? qrImageUrlRaw.trim()
    : null;

  return {
    teamId,
    provider: provider as Provider,
    accountName,
    accountNumber,
    qrImageUrl,
  };
}

async function assertManagerRole(teamId: string, userId: string): Promise<void> {
  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient
    .from("team_members")
    .select("role")
    .eq("team_id", teamId)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data || !["owner", "manager"].includes(String(data.role))) {
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
    const body = await parseJsonBody(request);
    const input = readBody(body);

    await assertManagerRole(input.teamId, user.id);

    const serviceClient = createServiceRoleClient();

    const { error: deactivateError } = await serviceClient
      .from("team_payment_accounts")
      .update({ is_active: false })
      .eq("team_id", input.teamId)
      .eq("provider", input.provider)
      .eq("is_active", true);

    if (deactivateError) {
      return errorResponse("deactivate_payment_account_failed", deactivateError.message, 400);
    }

    const { data, error } = await serviceClient
      .from("team_payment_accounts")
      .insert({
        team_id: input.teamId,
        provider: input.provider,
        account_name: input.accountName,
        account_number: input.accountNumber,
        qr_image_url: input.qrImageUrl,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      return errorResponse("register_payment_account_failed", error.message, 400);
    }

    return successResponse(data, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to register payment account.";
    const code = message === "NOT_MANAGER" ? "NOT_MANAGER" : "register_payment_account_failed";
    const status = message === "NOT_MANAGER" ? 403 : 400;
    return errorResponse(code, message, status);
  }
});