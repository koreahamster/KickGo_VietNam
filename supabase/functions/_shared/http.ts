import type { ApiResponse } from "./types.ts";
import { corsHeaders } from "./cors.ts";

export function handleOptionsRequest(request: Request): Response | null {
  if (request.method !== "OPTIONS") {
    return null;
  }

  return new Response("ok", { headers: corsHeaders });
}

export async function parseJsonBody(request: Request): Promise<Record<string, unknown>> {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("요청 본문은 JSON 객체여야 합니다.");
  }

  return body as Record<string, unknown>;
}

export function successResponse<T>(data: T, status = 200): Response {
  const payload: ApiResponse<T> = {
    success: true,
    data,
    error: null,
  };

  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

export function errorResponse(code: string, message: string, status = 400): Response {
  const payload: ApiResponse<null> = {
    success: false,
    data: null,
    error: {
      code,
      message,
    },
  };

  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
