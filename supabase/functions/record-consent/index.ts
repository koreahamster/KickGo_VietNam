import { createUserClient, requireUser } from "../_shared/auth.ts";
import {
  errorResponse,
  handleOptionsRequest,
  parseJsonBody,
  successResponse,
} from "../_shared/http.ts";
import {
  assertConsentType,
  readRequiredBoolean,
  readRequiredString,
} from "../_shared/validation.ts";

function getClientIpAddress(request: Request): string | null {
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const forwardedFor = request.headers.get("x-forwarded-for");

  if (!forwardedFor) {
    return null;
  }

  return forwardedFor.split(",")[0]?.trim() || null;
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
    const client = createUserClient(request);
    const user = await requireUser(client);
    const body = await parseJsonBody(request);

    const consentType = assertConsentType(readRequiredString(body, "consent_type"));
    const isAgreed = readRequiredBoolean(body, "is_agreed");
    const policyVersion = readRequiredString(body, "policy_version");

    if (consentType === "privacy_policy" && !isAgreed) {
      return errorResponse(
        "privacy_consent_required",
        "privacy_policy consent must be agreed.",
        400,
      );
    }

    const agreedAt = isAgreed ? new Date().toISOString() : null;
    const ipAddress = getClientIpAddress(request);

    const { data: existingConsent, error: existingConsentError } = await client
      .from("user_consents")
      .select("id")
      .eq("user_id", user.id)
      .eq("consent_type", consentType)
      .maybeSingle();

    if (existingConsentError) {
      console.error("[record-consent] existing_consent_query_failed", existingConsentError);
      return errorResponse(
        "existing_consent_query_failed",
        existingConsentError.message,
        400,
      );
    }

    if (existingConsent) {
      const { data: updatedConsent, error: updateConsentError } = await client
        .from("user_consents")
        .update({
          is_agreed: isAgreed,
          policy_version: policyVersion,
          agreed_at: agreedAt,
          ip_address: ipAddress,
        })
        .eq("id", existingConsent.id)
        .select("user_id, consent_type, is_agreed, policy_version, agreed_at")
        .single();

      if (updateConsentError) {
        console.error("[record-consent] update_failed", updateConsentError);
        return errorResponse("consent_update_failed", updateConsentError.message, 400);
      }

      return successResponse(updatedConsent, 200);
    }

    const { data: insertedConsent, error: insertConsentError } = await client
      .from("user_consents")
      .insert({
        user_id: user.id,
        consent_type: consentType,
        is_agreed: isAgreed,
        policy_version: policyVersion,
        agreed_at: agreedAt,
        ip_address: ipAddress,
      })
      .select("user_id, consent_type, is_agreed, policy_version, agreed_at")
      .single();

    if (insertConsentError) {
      console.error("[record-consent] insert_failed", insertConsentError);
      return errorResponse("consent_insert_failed", insertConsentError.message, 400);
    }

    return successResponse(insertedConsent, 201);
  } catch (error: unknown) {
    console.error("[record-consent] unexpected_failure", error);
    return errorResponse(
      "record_consent_failed",
      error instanceof Error ? error.message : "Failed to record consent.",
      400,
    );
  }
});