import { supabase } from "@/lib/supabase";
import type { ApiResponse, PlayerPosition } from "@/types/profile.types";
import type {
  ApplyMercenaryApiResponse,
  ApplyMercenaryRequest,
  CloseMercenaryPostApiResponse,
  CreateMercenaryPostApiResponse,
  CreateMercenaryPostRequest,
  MercenaryApplication,
  MercenaryPositionFilter,
  MercenaryPost,
  MercenaryPostDetail,
  RespondMercenaryApiResponse,
  RespondMercenaryRequest,
} from "@/types/mercenary.types";

type FunctionErrorContext = {
  status?: number;
  clone?: () => FunctionErrorContext;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
};

type TeamRow = {
  name: string;
  emblem_url: string | null;
  province_code: string;
  district_code: string;
} | {
  name: string;
  emblem_url: string | null;
  province_code: string;
  district_code: string;
}[] | null;

type MatchRow = {
  scheduled_at: string;
  venue_name: string | null;
} | {
  scheduled_at: string;
  venue_name: string | null;
}[] | null;

type ApplicationStatusRow = { status: string }[] | null;

type MercenaryPostRow = {
  id: string;
  team_id: string;
  match_id: string | null;
  needed_positions: PlayerPosition[];
  needed_count: number;
  province_code: string;
  description: string | null;
  status: MercenaryPost["status"];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  team: TeamRow;
  match: MatchRow;
  applications: ApplicationStatusRow;
};

type ApplicantProfileRow = {
  display_name: string | null;
  avatar_url: string | null;
} | {
  display_name: string | null;
  avatar_url: string | null;
}[] | null;

type MercenaryApplicationRow = {
  id: string;
  post_id: string;
  applicant_id: string;
  message: string | null;
  status: MercenaryApplication["status"];
  created_at: string;
  applicant: ApplicantProfileRow;
};

type MyApplicationPostRow = {
  id: string;
  team_id: string;
  match_id: string | null;
  needed_positions: PlayerPosition[];
  needed_count: number;
  province_code: string;
  description: string | null;
  status: MercenaryPost["status"];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  team: TeamRow;
  match: MatchRow;
};

type MyApplicationRow = {
  id: string;
  post_id: string;
  applicant_id: string;
  message: string | null;
  status: MercenaryApplication["status"];
  created_at: string;
  post: MyApplicationPostRow | MyApplicationPostRow[] | null;
};

const POST_SELECT = "id, team_id, match_id, needed_positions, needed_count, province_code, description, status, created_by, created_at, updated_at, team:teams!mercenary_posts_team_id_fkey(name, emblem_url, province_code, district_code), match:matches!mercenary_posts_match_id_fkey(scheduled_at, venue_name), applications:mercenary_applications(status)";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function getFunctionAuthHeaders(functionName: string): Promise<Record<string, string>> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(error.message);
  }
  if (!session?.access_token) {
    throw new Error("Session access token was not found.");
  }
  console.log("[mercenary] invokeFunction auth", functionName, true);
  return { Authorization: `Bearer ${session.access_token}` };
}

function getFunctionErrorContext(error: unknown): FunctionErrorContext | null {
  if (!isObjectRecord(error)) {
    return null;
  }
  const context = error.context;
  if (!isObjectRecord(context)) {
    return null;
  }
  return context as FunctionErrorContext;
}

function extractErrorMessageFromPayload(payload: unknown): string | null {
  if (!isObjectRecord(payload)) {
    return null;
  }
  const topLevelMessage = payload.message;
  if (typeof topLevelMessage === "string" && topLevelMessage.trim()) {
    return topLevelMessage;
  }
  const topLevelError = payload.error;
  if (typeof topLevelError === "string" && topLevelError.trim()) {
    return topLevelError;
  }
  if (!isObjectRecord(topLevelError)) {
    return null;
  }
  const code = topLevelError.code;
  const message = topLevelError.message;
  if (typeof code === "string" && typeof message === "string" && message.trim()) {
    return `${code}: ${message}`;
  }
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  return null;
}

async function readFunctionErrorMessage(error: unknown): Promise<string> {
  const context = getFunctionErrorContext(error);
  if (context) {
    const statusLabel = typeof context.status === "number" ? `HTTP ${context.status}` : "HTTP error";
    const jsonTarget = typeof context.clone === "function" ? context.clone() : context;
    if (typeof jsonTarget.json === "function") {
      try {
        const payload = await jsonTarget.json();
        const message = extractErrorMessageFromPayload(payload);
        if (message) {
          return `${statusLabel} - ${message}`;
        }
      } catch {
      }
    }
    const textTarget = typeof context.clone === "function" ? context.clone() : context;
    if (typeof textTarget.text === "function") {
      try {
        const text = (await textTarget.text()).trim();
        if (text) {
          return `${statusLabel} - ${text}`;
        }
      } catch {
      }
    }
    return statusLabel;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Edge Function request failed.";
}

async function invokeFunction<TResponse>(functionName: string, body?: Record<string, unknown>): Promise<TResponse> {
  const headers = await getFunctionAuthHeaders(functionName);
  const { data, error } = await supabase.functions.invoke<TResponse>(functionName, { body, headers });
  if (error) {
    const message = await readFunctionErrorMessage(error);
    console.log("[mercenary] invokeFunction error", functionName, message);
    throw new Error(message);
  }
  if (data === null) {
    throw new Error(`Function ${functionName} returned no data.`);
  }
  return data;
}

function assertSuccess<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (!response.success) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error(fallbackMessage);
  }
  return response.data;
}

function normalizeTeam(value: TeamRow): Exclude<TeamRow, TeamRow[] | null> | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function normalizeMatch(value: MatchRow): Exclude<MatchRow, MatchRow[] | null> | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function countAccepted(applications: ApplicationStatusRow): number {
  return applications ? applications.filter((item) => item.status === "accepted").length : 0;
}

function normalizePost(row: MercenaryPostRow): MercenaryPost {
  const team = normalizeTeam(row.team);
  const match = normalizeMatch(row.match);
  return {
    id: row.id,
    team_id: row.team_id,
    match_id: row.match_id,
    needed_positions: row.needed_positions,
    needed_count: row.needed_count,
    province_code: row.province_code,
    description: row.description,
    status: row.status,
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
    team_name: team?.name,
    team_emblem_url: team?.emblem_url ?? null,
    team_district_code: team?.district_code,
    match_scheduled_at: match?.scheduled_at ?? null,
    match_venue_name: match?.venue_name ?? null,
    accepted_count: countAccepted(row.applications),
  };
}

function normalizeApplicant(value: ApplicantProfileRow): { display_name: string | null; avatar_url: string | null } | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function buildApplicantPositionMap(rows: { user_id: string; position_first: PlayerPosition | null; position_second: PlayerPosition | null; position_third: PlayerPosition | null }[]): Map<string, PlayerPosition[]> {
  return rows.reduce((map, row) => {
    map.set(row.user_id, [row.position_first, row.position_second, row.position_third].filter(Boolean) as PlayerPosition[]);
    return map;
  }, new Map<string, PlayerPosition[]>());
}

function normalizeApplication(row: MercenaryApplicationRow, positionMap: Map<string, PlayerPosition[]>): MercenaryApplication {
  const applicant = normalizeApplicant(row.applicant);
  return {
    id: row.id,
    post_id: row.post_id,
    applicant_id: row.applicant_id,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
    applicant_name: applicant?.display_name ?? "KickGo Player",
    applicant_avatar_url: applicant?.avatar_url ?? null,
    applicant_positions: positionMap.get(row.applicant_id) ?? [],
  };
}

function getPositionFilterValues(position?: MercenaryPositionFilter): PlayerPosition[] | null {
  switch (position) {
    case "GK":
      return ["GK"];
    case "DF":
      return ["CB", "LB", "RB"];
    case "MF":
      return ["CDM", "CM", "CAM", "LM", "RM"];
    case "FW":
      return ["LW", "RW", "CF", "ST"];
    default:
      return null;
  }
}

export async function getMercenaryPosts(provinceCode: string, position?: MercenaryPositionFilter): Promise<MercenaryPost[]> {
  let query = supabase.from("mercenary_posts").select(POST_SELECT).eq("province_code", provinceCode).eq("status", "open").order("created_at", { ascending: false });
  const filterValues = getPositionFilterValues(position);
  if (filterValues) {
    query = query.overlaps("needed_positions", filterValues);
  }
  const result = await query;
  if (result.error) {
    throw new Error(result.error.message);
  }
  return ((result.data ?? []) as MercenaryPostRow[]).map(normalizePost);
}

export async function getTeamMercenaryPosts(teamId: string): Promise<MercenaryPost[]> {
  const result = await supabase.from("mercenary_posts").select(POST_SELECT).eq("team_id", teamId).order("created_at", { ascending: false });
  if (result.error) {
    throw new Error(result.error.message);
  }
  return ((result.data ?? []) as MercenaryPostRow[]).map(normalizePost);
}

export async function getMercenaryPostDetail(postId: string): Promise<MercenaryPostDetail> {
  const postResult = await supabase.from("mercenary_posts").select(POST_SELECT).eq("id", postId).maybeSingle();
  if (postResult.error) {
    throw new Error(postResult.error.message);
  }
  if (!postResult.data) {
    throw new Error("Mercenary post detail is unavailable.");
  }

  const applicationsResult = await supabase
    .from("mercenary_applications")
    .select("id, post_id, applicant_id, message, status, created_at, applicant:profiles!mercenary_applications_applicant_id_fkey(display_name, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (applicationsResult.error) {
    throw new Error(applicationsResult.error.message);
  }

  const applicationRows = (applicationsResult.data ?? []) as MercenaryApplicationRow[];
  const applicantIds = Array.from(new Set(applicationRows.map((row) => row.applicant_id)));
  let positionMap = new Map<string, PlayerPosition[]>();

  if (applicantIds.length > 0) {
    const profileResult = await supabase.from("player_profiles").select("user_id, position_first, position_second, position_third").in("user_id", applicantIds);
    if (profileResult.error) {
      throw new Error(profileResult.error.message);
    }
    positionMap = buildApplicantPositionMap((profileResult.data ?? []) as { user_id: string; position_first: PlayerPosition | null; position_second: PlayerPosition | null; position_third: PlayerPosition | null }[]);
  }

  return {
    post: normalizePost(postResult.data as MercenaryPostRow),
    applications: applicationRows.map((row) => normalizeApplication(row, positionMap)),
  };
}

export async function getMyApplications(userId: string): Promise<MercenaryApplication[]> {
  const result = await supabase
    .from("mercenary_applications")
    .select("id, post_id, applicant_id, message, status, created_at, post:mercenary_posts!mercenary_applications_post_id_fkey(id, team_id, match_id, needed_positions, needed_count, province_code, description, status, created_by, created_at, updated_at, team:teams!mercenary_posts_team_id_fkey(name, emblem_url, province_code, district_code), match:matches!mercenary_posts_match_id_fkey(scheduled_at, venue_name))")
    .eq("applicant_id", userId)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return ((result.data ?? []) as MyApplicationRow[]).map((row) => {
    const post = Array.isArray(row.post) ? row.post[0] ?? null : row.post;
    const team = post ? normalizeTeam(post.team) : null;
    const match = post ? normalizeMatch(post.match) : null;
    return {
      id: row.id,
      post_id: row.post_id,
      applicant_id: row.applicant_id,
      message: row.message,
      status: row.status,
      created_at: row.created_at,
      team_name: team?.name,
      team_emblem_url: team?.emblem_url ?? null,
      needed_positions: post?.needed_positions ?? [],
      match_scheduled_at: match?.scheduled_at ?? null,
    };
  });
}

export async function createMercenaryPost(request: CreateMercenaryPostRequest): Promise<MercenaryPost> {
  const response = await invokeFunction<CreateMercenaryPostApiResponse>("create-mercenary-post", {
    team_id: request.team_id,
    match_id: request.match_id ?? null,
    needed_positions: request.needed_positions,
    needed_count: request.needed_count,
    province_code: request.province_code,
    description: request.description ?? null,
  });
  return assertSuccess(response, "Mercenary post creation returned no data.");
}

export async function applyMercenary(request: ApplyMercenaryRequest): Promise<MercenaryApplication> {
  const response = await invokeFunction<ApplyMercenaryApiResponse>("apply-mercenary", {
    post_id: request.post_id,
    message: request.message ?? null,
  });
  return assertSuccess(response, "Mercenary application returned no data.");
}

export async function respondMercenaryApplication(request: RespondMercenaryRequest): Promise<MercenaryApplication> {
  const response = await invokeFunction<RespondMercenaryApiResponse>("respond-mercenary-application", {
    application_id: request.application_id,
    decision: request.decision,
  });
  return assertSuccess(response, "Mercenary application response returned no data.");
}

export async function closeMercenaryPost(postId: string): Promise<MercenaryPost> {
  const response = await invokeFunction<CloseMercenaryPostApiResponse>("close-mercenary-post", { post_id: postId });
  return assertSuccess(response, "Mercenary post close returned no data.");
}
export async function getAcceptedMercenariesForMatch(teamId: string, matchId: string): Promise<MercenaryApplication[]> {
  const postsResult = await supabase
    .from("mercenary_posts")
    .select("id")
    .eq("team_id", teamId)
    .eq("match_id", matchId);

  if (postsResult.error) {
    throw new Error(postsResult.error.message);
  }

  const postIds = (postsResult.data ?? []).map((item) => item.id as string);
  if (postIds.length === 0) {
    return [];
  }

  const applicationsResult = await supabase
    .from("mercenary_applications")
    .select("id, post_id, applicant_id, message, status, created_at, applicant:profiles!mercenary_applications_applicant_id_fkey(display_name, avatar_url)")
    .in("post_id", postIds)
    .eq("status", "accepted")
    .order("created_at", { ascending: true });

  if (applicationsResult.error) {
    throw new Error(applicationsResult.error.message);
  }

  const applicationRows = (applicationsResult.data ?? []) as MercenaryApplicationRow[];
  const applicantIds = Array.from(new Set(applicationRows.map((row) => row.applicant_id)));
  let positionMap = new Map<string, PlayerPosition[]>();

  if (applicantIds.length > 0) {
    const profileResult = await supabase
      .from("player_profiles")
      .select("user_id, position_first, position_second, position_third")
      .in("user_id", applicantIds);

    if (profileResult.error) {
      throw new Error(profileResult.error.message);
    }

    positionMap = buildApplicantPositionMap(
      (profileResult.data ?? []) as { user_id: string; position_first: PlayerPosition | null; position_second: PlayerPosition | null; position_third: PlayerPosition | null }[],
    );
  }

  return applicationRows.map((row) => normalizeApplication(row, positionMap));
}
