import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import { errorResponse, handleOptionsRequest, successResponse } from "../_shared/http.ts";
import { readRequiredString } from "../_shared/validation.ts";

type TournamentStatus = "open" | "in_progress" | "finished";

type TournamentRow = {
  id: string;
  name: string;
  host_team_id: string;
  province_code: string | null;
  max_teams: number;
  status: TournamentStatus;
  created_by: string | null;
  created_at: string;
};

type RegistrationRow = {
  id: string;
  tournament_id: string;
  team_id: string;
  seed_number: number | null;
  created_at: string;
};

function parseBody(request: Request): Promise<Record<string, unknown>> {
  return request
    .json()
    .then((body) => {
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new Error("Request body must be a JSON object.");
      }
      return body as Record<string, unknown>;
    })
    .catch(() => {
      throw new Error("Request body must be valid JSON.");
    });
}

function readTeamIds(body: Record<string, unknown>): string[] {
  const rawValue = body.team_ids;
  if (!Array.isArray(rawValue)) {
    throw new Error("team_ids must be an array.");
  }

  const ids = rawValue.map((value) => {
    if (typeof value !== "string" || !value.trim()) {
      throw new Error("team_ids must contain valid team ids.");
    }
    return value.trim();
  });

  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length < 2 || uniqueIds.length > 4) {
    throw new Error("team_ids must contain between 2 and 4 unique teams.");
  }

  return uniqueIds;
}

function shuffleIds(values: string[]): string[] {
  const clone = [...values];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = clone[index];
    clone[index] = clone[randomIndex];
    clone[randomIndex] = current;
  }
  return clone;
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

  if (!data || (data.role !== "owner" && data.role !== "manager")) {
    throw new Error("NOT_MANAGER");
  }
}

function buildScheduledAt(offsetDays: number, offsetHours: number): string {
  const value = new Date();
  value.setDate(value.getDate() + offsetDays);
  value.setHours(19 + offsetHours, 0, 0, 0);
  return value.toISOString();
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

    const name = readRequiredString(body, "name");
    const hostTeamId = readRequiredString(body, "host_team_id");
    const provinceCode = readRequiredString(body, "province_code");
    const teamIds = readTeamIds(body);

    if (!teamIds.includes(hostTeamId)) {
      throw new Error("host_team_id must be included in team_ids.");
    }

    await assertManagerRole(hostTeamId, user.id);

    const shuffledIds = shuffleIds(teamIds);

    const { data: tournament, error: tournamentError } = await serviceClient
      .from("tournaments")
      .insert({
        name,
        host_team_id: hostTeamId,
        province_code: provinceCode,
        max_teams: 4,
        status: "open",
        created_by: user.id,
      })
      .select("id, name, host_team_id, province_code, max_teams, status, created_by, created_at")
      .single<TournamentRow>();

    if (tournamentError || !tournament) {
      return errorResponse("create_tournament_failed", tournamentError?.message ?? "Failed to create tournament.", 400);
    }

    const registrationPayload = shuffledIds.map((teamId, index) => ({
      tournament_id: tournament.id,
      team_id: teamId,
      seed_number: index + 1,
    }));

    const { data: registrations, error: registrationError } = await serviceClient
      .from("tournament_team_registrations")
      .insert(registrationPayload)
      .select("id, tournament_id, team_id, seed_number, created_at");

    if (registrationError) {
      await serviceClient.from("tournaments").delete().eq("id", tournament.id);
      return errorResponse("registration_insert_failed", registrationError.message, 400);
    }

    if (shuffledIds.length === 4) {
      const semiFinalMatches = [
        {
          home_team_id: shuffledIds[0],
          away_team_id: shuffledIds[3],
          scheduled_at: buildScheduledAt(7, 0),
          venue_name: null,
          sport_type: "soccer",
          match_type: "tournament",
          status: "scheduled",
          created_by: user.id,
          opponent_name: null,
          team_side: "home",
          quarter_count: 2,
          quarter_minutes: 25,
          attendance_deadline_at: buildScheduledAt(6, 23),
          notice: `${name} semifinal`,
        },
        {
          home_team_id: shuffledIds[1],
          away_team_id: shuffledIds[2],
          scheduled_at: buildScheduledAt(7, 2),
          venue_name: null,
          sport_type: "soccer",
          match_type: "tournament",
          status: "scheduled",
          created_by: user.id,
          opponent_name: null,
          team_side: "home",
          quarter_count: 2,
          quarter_minutes: 25,
          attendance_deadline_at: buildScheduledAt(6, 23),
          notice: `${name} semifinal`,
        },
      ];

      const { data: createdMatches, error: matchError } = await serviceClient
        .from("matches")
        .insert(semiFinalMatches)
        .select("id, home_team_id, away_team_id");

      if (matchError || !createdMatches) {
        await serviceClient.from("tournament_team_registrations").delete().eq("tournament_id", tournament.id);
        await serviceClient.from("tournaments").delete().eq("id", tournament.id);
        return errorResponse("create_tournament_matches_failed", matchError?.message ?? "Failed to create tournament matches.", 400);
      }

      const pollPayload = createdMatches.flatMap((match) => {
        const rows = [{ match_id: match.id, team_id: match.home_team_id }];
        if (match.away_team_id) {
          rows.push({ match_id: match.id, team_id: match.away_team_id });
        }
        return rows;
      });

      const { error: pollError } = await serviceClient.from("attendance_polls").insert(pollPayload);
      if (pollError) {
        return errorResponse("attendance_poll_insert_failed", pollError.message, 400);
      }

      const bracketPayload = [
        {
          tournament_id: tournament.id,
          round: 1,
          match_order: 1,
          home_team_id: shuffledIds[0],
          away_team_id: shuffledIds[3],
          match_id: createdMatches[0]?.id ?? null,
          winner_team_id: null,
        },
        {
          tournament_id: tournament.id,
          round: 1,
          match_order: 2,
          home_team_id: shuffledIds[1],
          away_team_id: shuffledIds[2],
          match_id: createdMatches[1]?.id ?? null,
          winner_team_id: null,
        },
        {
          tournament_id: tournament.id,
          round: 2,
          match_order: 1,
          home_team_id: null,
          away_team_id: null,
          match_id: null,
          winner_team_id: null,
        },
      ];

      const { error: bracketError } = await serviceClient.from("tournament_brackets").insert(bracketPayload);
      if (bracketError) {
        return errorResponse("create_tournament_brackets_failed", bracketError.message, 400);
      }
    }

    return successResponse({
      ...tournament,
      registrations: (registrations ?? []) as RegistrationRow[],
    }, 201);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create tournament.";
    const status = message === "NOT_MANAGER" ? 403 : 400;
    const code = message === "NOT_MANAGER" ? "NOT_MANAGER" : "create_tournament_failed";
    return errorResponse(code, message, status);
  }
});