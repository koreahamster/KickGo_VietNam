import { createServiceRoleClient, createUserClient, requireUser } from "../_shared/auth.ts";
import {
  errorResponse,
  handleOptionsRequest,
  parseJsonBody,
  successResponse,
} from "../_shared/http.ts";
import {
  assertRegion,
  assertVisibility,
  readOptionalNullableNumber,
  readOptionalString,
  readOptionalStringArray,
  readRequiredString,
} from "../_shared/validation.ts";
import type { SupportedVisibility } from "../_shared/types.ts";

const SPORT_TYPES = ["soccer", "futsal", "both"] as const;
const GENDER_TYPES = ["male", "female", "mixed"] as const;
const AGE_GROUPS = ["10s", "20s", "30s", "40s", "50s", "60_plus"] as const;
const UNIFORM_COLORS = [
  "dark_red",
  "red",
  "orange",
  "yellow",
  "dark_green",
  "green",
  "light_green",
  "navy",
  "blue",
  "sky",
  "purple",
  "black",
  "gray",
  "white",
] as const;
const MATCH_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const MATCH_TIMES = ["dawn", "morning", "day", "evening", "night"] as const;
const FORMATIONS = ["4-3-3", "4-4-2", "4-2-3-1", "3-5-2", "5-3-2", "3-4-3", "other"] as const;
const TACTIC_STYLES = ["build_up", "counter_attack", "balanced"] as const;
const ATTACK_DIRECTIONS = ["center", "both_sides", "left_side", "right_side"] as const;
const DEFENSE_STYLES = ["man_to_man", "zone", "balanced"] as const;

function slugifyTeamName(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return normalized || `team-${crypto.randomUUID().slice(0, 8)}`;
}

async function createUniqueSlug(client: ReturnType<typeof createServiceRoleClient>, name: string): Promise<string> {
  const baseSlug = slugifyTeamName(name);

  for (let suffix = 0; suffix < 50; suffix += 1) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
    const { data, error } = await client.from("teams").select("id").eq("slug", candidate).maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return candidate;
    }
  }

  return `team-${crypto.randomUUID()}`;
}

function assertEnumValue<T extends string>(value: string, allowed: readonly T[], fieldName: string): T {
  if ((allowed as readonly string[]).includes(value)) {
    return value as T;
  }

  throw new Error(`${fieldName} is invalid.`);
}

function assertEnumArray<T extends string>(
  values: string[],
  allowed: readonly T[],
  fieldName: string,
  limits?: { min?: number; max?: number },
): T[] {
  const deduped = Array.from(new Set(values));

  if (limits?.min !== undefined && deduped.length < limits.min) {
    throw new Error(`${fieldName} must contain at least ${limits.min} item(s).`);
  }

  if (limits?.max !== undefined && deduped.length > limits.max) {
    throw new Error(`${fieldName} must contain no more than ${limits.max} item(s).`);
  }

  for (const value of deduped) {
    if (!(allowed as readonly string[]).includes(value)) {
      throw new Error(`${fieldName} contains an invalid value.`);
    }
  }

  return deduped as T[];
}

function assertTeamName(value: string): string {
  const trimmed = value.trim();

  if (trimmed.length < 2 || trimmed.length > 40) {
    throw new Error("name must be between 2 and 40 characters.");
  }

  return trimmed;
}

function assertDescriptionLength(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  if (value.length > 255) {
    throw new Error("description must be 255 characters or fewer.");
  }

  return value;
}

function normalizeFoundedDate(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (!/^\d{8}$/.test(digits)) {
    throw new Error("founded_date must be 8 digits.");
  }

  const normalized = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  const parsed = new Date(`${normalized}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== normalized) {
    throw new Error("founded_date is invalid.");
  }

  return normalized;
}

function assertOptionalUrl(value: string | undefined, fieldName: string): string | null {
  if (!value) {
    return null;
  }

  try {
    new URL(value);
    return value;
  } catch {
    throw new Error(`${fieldName} must be a valid URL.`);
  }
}

function assertMonthlyFee(value: number | null | undefined): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value < 0) {
    throw new Error("monthly_fee must be a non-negative integer.");
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

    const name = assertTeamName(readRequiredString(body, "name"));
    const sportType = assertEnumValue(readRequiredString(body, "sport_type"), SPORT_TYPES, "sport_type");
    const foundedDate = normalizeFoundedDate(readRequiredString(body, "founded_date"));
    const provinceCode = readRequiredString(body, "province_code");
    const districtCode = readRequiredString(body, "district_code");
    const homeGround = readOptionalString(body, "home_ground") ?? null;
    const genderType = assertEnumValue(readRequiredString(body, "gender_type"), GENDER_TYPES, "gender_type");
    const ageGroups = assertEnumArray(readOptionalStringArray(body, "age_groups") ?? [], AGE_GROUPS, "age_groups", { min: 1, max: AGE_GROUPS.length });
    const uniformColors = assertEnumArray(readOptionalStringArray(body, "uniform_colors") ?? [], UNIFORM_COLORS, "uniform_colors", { min: 1, max: 3 });
    const matchDays = assertEnumArray(readOptionalStringArray(body, "match_days") ?? [], MATCH_DAYS, "match_days", { min: 1, max: MATCH_DAYS.length });
    const matchTimes = assertEnumArray(readOptionalStringArray(body, "match_times") ?? [], MATCH_TIMES, "match_times", { min: 1, max: MATCH_TIMES.length });
    const description = assertDescriptionLength(readOptionalString(body, "description"));
    const monthlyFee = assertMonthlyFee(readOptionalNullableNumber(body, "monthly_fee"));
    const emblemUrl = assertOptionalUrl(readOptionalString(body, "emblem_url"), "emblem_url");
    const photoUrl = assertOptionalUrl(readOptionalString(body, "photo_url"), "photo_url");
    const formationA = assertEnumValue(readRequiredString(body, "formation_a"), FORMATIONS, "formation_a");
    const formationB = assertEnumValue(readRequiredString(body, "formation_b"), FORMATIONS, "formation_b");
    const tacticStyle = assertEnumValue(readRequiredString(body, "tactic_style"), TACTIC_STYLES, "tactic_style");
    const attackDirection = assertEnumValue(readRequiredString(body, "attack_direction"), ATTACK_DIRECTIONS, "attack_direction");
    const defenseStyle = assertEnumValue(readRequiredString(body, "defense_style"), DEFENSE_STYLES, "defense_style");
    const visibility = assertVisibility(readOptionalString(body, "visibility") ?? "public") as SupportedVisibility;

    assertRegion("VN", provinceCode, districtCode);

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return errorResponse("profile_lookup_failed", profileError.message, 400);
    }

    if (!profile) {
      return errorResponse("profile_required", "Common profile is required before creating a team.", 400);
    }

    const slug = await createUniqueSlug(serviceClient, name);

    const teamPayload = {
      name,
      slug,
      emblem_url: emblemUrl,
      country_code: "VN",
      province_code: provinceCode,
      district_code: districtCode,
      description,
      visibility,
      is_recruiting: true,
      recruitment_status: "open",      sport_type: sportType,
      founded_date: foundedDate,
      home_ground: homeGround,
      gender_type: genderType,
      age_groups: ageGroups,
      uniform_colors: uniformColors,
      photo_url: photoUrl,
      match_days: matchDays,
      match_times: matchTimes,
      monthly_fee: monthlyFee,
      formation_a: formationA,
      formation_b: formationB,
      tactic_style: tacticStyle,
      attack_direction: attackDirection,
      defense_style: defenseStyle,
    };

    const { data: team, error: teamInsertError } = await serviceClient
      .from("teams")
      .insert(teamPayload)
      .select("id, slug")
      .single();

    if (teamInsertError) {
      console.error("[create-team] team_insert_failed", teamInsertError);
      return errorResponse("team_insert_failed", teamInsertError.message, 400);
    }

    const membershipPayload = {
      team_id: team.id,
      user_id: user.id,
      role: "owner",
      status: "active",
      joined_at: new Date().toISOString(),
    };

    const { error: membershipInsertError } = await serviceClient.from("team_members").insert(membershipPayload);

    if (membershipInsertError) {
      console.error("[create-team] team_member_insert_failed", membershipInsertError);
      const { error: rollbackError } = await serviceClient.from("teams").delete().eq("id", team.id);

      if (rollbackError) {
        console.error("[create-team] rollback_failed", rollbackError);
      }

      return errorResponse("team_member_insert_failed", membershipInsertError.message, 400);
    }

    return successResponse(
      {
        team_id: team.id,
        slug: team.slug,
        member_role: "owner",
      },
      201,
    );
  } catch (error: unknown) {
    console.error("[create-team] unexpected_failure", error);
    return errorResponse(
      "create_team_failed",
      error instanceof Error ? error.message : "Failed to create team.",
      400,
    );
  }
});