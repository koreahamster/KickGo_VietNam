import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, successResponse } from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";

type RosterPlayerInput = {
  user_id: string;
  squad_number: number | null;
  position: string | null;
  is_mercenary: boolean;
};

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

function readNullableInteger(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = typeof value === "number" ? Math.trunc(value) : typeof value === "string" ? Number.parseInt(value, 10) : Number.NaN;
  if (!Number.isFinite(parsed)) {
    throw new Error("INVALID_SQUAD_NUMBER");
  }
  return parsed;
}

function readPlayers(body: Record<string, unknown>): RosterPlayerInput[] {
  const raw = body.players;
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error("PLAYERS_REQUIRED");
  }

  return raw.map((item) => {
    if (!isObjectRecord(item)) {
      throw new Error("INVALID_PLAYER_ROW");
    }

    const userId = readRequiredString(item, "user_id");
    const squadNumber = readNullableInteger(item.squad_number);
    const position = typeof item.position === "string" && item.position.trim() ? item.position.trim() : null;
    const isMercenary = item.is_mercenary === true;

    return {
      user_id: userId,
      squad_number: squadNumber,
      position: position,
      is_mercenary: isMercenary,
    };
  });
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
    const teamId = readRequiredString(body, "team_id");
    const players = readPlayers(body);

    const match = await getMatch(serviceClient, matchId);
    const isRelatedTeam = match.home_team_id === teamId || match.away_team_id === teamId;
    if (!isRelatedTeam) {
      throw new Error("TEAM_NOT_IN_MATCH");
    }
    if (match.status !== "scheduled") {
      throw new Error("MATCH_NOT_SCHEDULED");
    }

    await assertManagerRole(serviceClient, teamId, user.id);

    const removeResult = await serviceClient.from("match_rosters").delete().eq("match_id", matchId).eq("team_id", teamId);
    if (removeResult.error) {
      return errorResponse("submit_match_roster_failed", removeResult.error.message, 400);
    }

    const { data, error } = await serviceClient
      .from("match_rosters")
      .insert(
        players.map((player) => ({
          match_id: matchId,
          team_id: teamId,
          user_id: player.user_id,
          squad_number: player.squad_number,
          position: player.position,
          is_mercenary: player.is_mercenary,
        })),
      )
      .select("id, match_id, team_id, user_id, squad_number, position, is_mercenary, created_at");

    if (error || !data) {
      return errorResponse("submit_match_roster_failed", error?.message ?? "Failed to submit roster.", 400);
    }

    return successResponse(data, 200);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to submit roster.";
    const code = ["NOT_MANAGER", "MATCH_NOT_FOUND", "TEAM_NOT_IN_MATCH", "MATCH_NOT_SCHEDULED", "PLAYERS_REQUIRED", "INVALID_PLAYER_ROW", "INVALID_SQUAD_NUMBER"].includes(message)
      ? message
      : "submit_match_roster_failed";
    const status = message === "NOT_MANAGER" ? 403 : message === "MATCH_NOT_FOUND" ? 404 : 400;
    return errorResponse(code, message, status);
  }
});
