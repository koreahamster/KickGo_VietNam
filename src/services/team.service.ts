import type { ApiResponse } from "@/types/profile.types";
import { supabase } from "@/lib/supabase";
import type {
  CreateAnnouncementRequest,
  CreateTeamAnnouncementApiResponse,
  CreateTeamInput,
  CreateTeamInviteApiResponse,
  CreateTeamInviteResult,
  CreateTeamResult,
  JoinTeamApiResponse,
  JoinTeamResult,
  KickTeamMemberApiResponse,
  KickTeamMemberInput,
  KickTeamMemberResult,
  RecruitmentApplication,
  RecruitmentDecision,
  RequestTeamAssetUploadApiResponse,
  RequestTeamAssetUploadInput,
  RequestTeamAssetUploadResult,
  RespondRecruitmentApplicationApiResponse,
  SupportedTeamAssetContentType,
  TeamAnnouncement,
  TeamDetailRecord,
  TeamMemberProfileRecord,
  TeamMemberRole,
  TeamMemberStatus,
  TeamMembershipRecord,
  TeamMembersQueryResult,
  TeamRecord,
  TeamRecruitmentPost,
  TeamRosterMemberRecord,
  ToggleAnnouncementPinApiResponse,
  TogglePinRequest,
  ToggleRecruitmentStatusInput,
  UpdateRecruitmentStatusApiResponse,
  UpdateTeamApiResponse,
  UpdateTeamInput,
  UpdateTeamMemberRoleInput,
  UpdateTeamMemberRoleResult,
  UpdateTeamResult,
  UploadTeamAssetInput,
} from "@/types/team.types";

type FunctionErrorContext = {
  status?: number;
  clone?: () => FunctionErrorContext;
  json?: () => Promise<unknown>;
  text?: () => Promise<string>;
};

type RawTeamMembershipRow = {
  id: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  joined_at: string | null;
  team: TeamRecord | TeamRecord[] | null;
};

type RawTeamRosterRow = {
  id: string;
  user_id: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  joined_at: string | null;
  squad_number: number | null;
  profile: TeamMemberProfileRecord | TeamMemberProfileRecord[] | null;
};

type RawAnnouncementAuthorRow = {
  display_name: string | null;
} | {
  display_name: string | null;
}[] | null;

type RawTeamAnnouncementRow = {
  id: string;
  team_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  created_at: string;
  author_id: string;
  author: RawAnnouncementAuthorRow;
};

type RawRecruitmentPostRow = {
  id: string;
  team_id: string;
  title: string;
  body: string;
  created_at: string;
  created_by: string | null;
};

type RawRecruitmentApplicantProfileRow = {
  display_name: string | null;
  avatar_url: string | null;
} | {
  display_name: string | null;
  avatar_url: string | null;
}[] | null;

type RawRecruitmentApplicationRow = {
  id: string;
  post_id: string;
  applicant_id: string;
  message: string;
  status: RecruitmentApplication["status"];
  created_at: string;
  applicant: RawRecruitmentApplicantProfileRow;
};

const TEAM_SELECT_COLUMNS =
  "id, name, slug, emblem_url, photo_url, country_code, province_code, district_code, home_ground, description, visibility, is_recruiting, recruitment_status, sport_type, founded_date, gender_type, age_groups, uniform_colors, match_days, match_times, monthly_fee, formation_a, formation_b, tactic_style, attack_direction, defense_style";

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("Authenticated user was not found.");
  }

  return user.id;
}

async function getFunctionAuthHeaders(functionName: string): Promise<Record<string, string>> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  if (!session?.access_token) {
    throw new Error("Session access token was not found.");
  }

  console.log("[team] invokeFunction auth", functionName, true);

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
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
          return typeof context.status === "number" ? `${statusLabel} - ${message}` : message;
        }
      } catch {
        // fall through
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
        // fall through
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
  const { data, error } = await supabase.functions.invoke<TResponse>(functionName, {
    body,
    headers,
  });

  if (error) {
    const message = await readFunctionErrorMessage(error);
    console.log("[team] invokeFunction error", functionName, message);
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

function normalizeMembership(row: RawTeamMembershipRow): TeamMembershipRecord | null {
  const team = Array.isArray(row.team) ? row.team[0] ?? null : row.team;

  if (!team) {
    return null;
  }

  return {
    id: row.id,
    role: row.role,
    status: row.status,
    joined_at: row.joined_at,
    team,
  };
}

function normalizeMemberProfile(
  value: TeamMemberProfileRecord | TeamMemberProfileRecord[] | null,
): TeamMemberProfileRecord | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function normalizeRosterMember(row: RawTeamRosterRow): TeamRosterMemberRecord {
  return {
    id: row.id,
    user_id: row.user_id,
    role: row.role,
    status: row.status,
    joined_at: row.joined_at,
    squad_number: row.squad_number,
    profile: normalizeMemberProfile(row.profile),
  };
}

function normalizeAnnouncementAuthor(value: RawAnnouncementAuthorRow): string | null {
  if (Array.isArray(value)) {
    return value[0]?.display_name ?? null;
  }

  return value?.display_name ?? null;
}

function normalizeTeamAnnouncement(row: RawTeamAnnouncementRow): TeamAnnouncement {
  return {
    id: row.id,
    team_id: row.team_id,
    title: row.title,
    body: row.body,
    is_pinned: row.is_pinned,
    created_at: row.created_at,
    author_id: row.author_id,
    author_display_name: normalizeAnnouncementAuthor(row.author),
  };
}

function normalizeRecruitmentPost(row: RawRecruitmentPostRow): TeamRecruitmentPost {
  return {
    id: row.id,
    team_id: row.team_id,
    title: row.title,
    body: row.body,
    created_at: row.created_at,
    created_by: row.created_by,
  };
}

function normalizeRecruitmentApplicant(
  value: RawRecruitmentApplicantProfileRow,
): { display_name: string | null; avatar_url: string | null } | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function normalizeRecruitmentApplication(row: RawRecruitmentApplicationRow): RecruitmentApplication {
  const applicant = normalizeRecruitmentApplicant(row.applicant);

  return {
    id: row.id,
    post_id: row.post_id,
    applicant_id: row.applicant_id,
    applicant_name: applicant?.display_name ?? "Applicant",
    applicant_avatar_url: applicant?.avatar_url ?? null,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
  };
}

async function readFileBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error(`Failed to read file with HTTP ${response.status}.`);
  }

  return response.blob();
}

export async function getMyTeams(): Promise<TeamMembershipRecord[]> {
  const userId = await getAuthenticatedUserId();
  const teamMembersResult = await supabase
    .from("team_members")
    .select(`id, role, status, joined_at, team:teams!inner(${TEAM_SELECT_COLUMNS})`)
    .eq("user_id", userId)
    .eq("status", "active")
    .order("joined_at", { ascending: false });

  if (teamMembersResult.error) {
    throw new Error(teamMembersResult.error.message);
  }

  const rows = (teamMembersResult.data ?? []) as RawTeamMembershipRow[];

  return rows
    .map((row) => normalizeMembership(row))
    .filter((membership): membership is TeamMembershipRecord => membership !== null);
}

export async function getTeamDetail(teamId: string): Promise<TeamDetailRecord> {
  const userId = await getAuthenticatedUserId();

  const [teamResult, currentMembershipResult, membersResult] = await Promise.all([
    supabase.from("teams").select(TEAM_SELECT_COLUMNS).eq("id", teamId).maybeSingle(),
    supabase
      .from("team_members")
      .select(`id, role, status, joined_at, team:teams!inner(${TEAM_SELECT_COLUMNS})`)
      .eq("team_id", teamId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("team_members")
      .select(
        "id, user_id, role, status, joined_at, squad_number, profile:profiles!team_members_user_id_fkey(id, display_name, avatar_url, visibility)",
      )
      .eq("team_id", teamId)
      .eq("status", "active")
      .order("joined_at", { ascending: true }),
  ]);

  if (teamResult.error) {
    throw new Error(teamResult.error.message);
  }

  if (currentMembershipResult.error) {
    throw new Error(currentMembershipResult.error.message);
  }

  if (membersResult.error) {
    throw new Error(membersResult.error.message);
  }

  const team = (teamResult.data ?? null) as TeamRecord | null;

  if (!team) {
    throw new Error("Team was not found.");
  }

  const currentMembership = currentMembershipResult.data
    ? normalizeMembership(currentMembershipResult.data as RawTeamMembershipRow)
    : null;
  const members = ((membersResult.data ?? []) as RawTeamRosterRow[]).map((row) => normalizeRosterMember(row));

  return {
    team,
    currentMembership,
    members,
  };
}

export async function getTeamMembers(teamId: string): Promise<TeamMembersQueryResult> {
  const userId = await getAuthenticatedUserId();
  const membersResult = await supabase
    .from("team_members")
    .select(
      "id, user_id, role, status, joined_at, squad_number, profile:profiles!team_members_user_id_fkey(id, display_name, avatar_url, visibility)",
    )
    .eq("team_id", teamId)
    .eq("status", "active")
    .order("joined_at", { ascending: true });

  if (membersResult.error) {
    throw new Error(membersResult.error.message);
  }

  const members = ((membersResult.data ?? []) as RawTeamRosterRow[]).map((row) => normalizeRosterMember(row));
  const currentRole = members.find((member) => member.user_id === userId)?.role ?? null;

  return {
    currentRole,
    members,
  };
}

export async function getTeamAnnouncements(teamId: string): Promise<TeamAnnouncement[]> {
  const result = await supabase
    .from("team_announcements")
    .select("id, team_id, title, body, is_pinned, created_at, author_id, author:profiles!team_announcements_author_id_fkey(display_name)")
    .eq("team_id", teamId)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return ((result.data ?? []) as RawTeamAnnouncementRow[]).map((row) => normalizeTeamAnnouncement(row));
}

export async function getTeamAnnouncementDetail(teamId: string, announcementId: string): Promise<TeamAnnouncement> {
  const result = await supabase
    .from("team_announcements")
    .select("id, team_id, title, body, is_pinned, created_at, author_id, author:profiles!team_announcements_author_id_fkey(display_name)")
    .eq("team_id", teamId)
    .eq("id", announcementId)
    .single();

  if (result.error) {
    throw new Error(result.error.message);
  }

  return normalizeTeamAnnouncement(result.data as RawTeamAnnouncementRow);
}

export async function createTeamAnnouncement(request: CreateAnnouncementRequest): Promise<TeamAnnouncement> {
  const response = await invokeFunction<CreateTeamAnnouncementApiResponse>("create-team-announcement", {
    team_id: request.team_id,
    title: request.title,
    body: request.body,
    is_pinned: request.is_pinned,
  });

  return assertSuccess(response, "Team announcement creation returned no data.");
}

export async function toggleAnnouncementPin(request: TogglePinRequest): Promise<TeamAnnouncement> {
  const response = await invokeFunction<ToggleAnnouncementPinApiResponse>("toggle-announcement-pin", {
    announcement_id: request.announcement_id,
  });

  return assertSuccess(response, "Announcement pin toggle returned no data.");
}


export async function updateRecruitmentStatus(
  teamId: string,
  recruitmentStatus: ToggleRecruitmentStatusInput["recruitmentStatus"],
): Promise<TeamRecord> {
  const response = await invokeFunction<UpdateRecruitmentStatusApiResponse>("update-team-recruitment-status", {
    team_id: teamId,
    recruitment_status: recruitmentStatus,
  });

  return assertSuccess(response, "Recruitment status update returned no data.");
}

export async function getRecruitmentPosts(teamId: string): Promise<TeamRecruitmentPost[]> {
  const result = await supabase
    .from("team_recruitment_posts")
    .select("id, team_id, title, body, created_at, created_by")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return ((result.data ?? []) as RawRecruitmentPostRow[]).map((row) => normalizeRecruitmentPost(row));
}

export async function getRecruitmentApplications(postId: string): Promise<RecruitmentApplication[]> {
  const result = await supabase
    .from("team_recruitment_applications")
    .select("id, post_id, applicant_id, message, status, created_at, applicant:profiles!team_recruitment_applications_applicant_id_fkey(display_name, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return ((result.data ?? []) as RawRecruitmentApplicationRow[]).map((row) => normalizeRecruitmentApplication(row));
}

export async function respondRecruitmentApplication(
  applicationId: string,
  decision: RecruitmentDecision,
): Promise<RecruitmentApplication> {
  const response = await invokeFunction<RespondRecruitmentApplicationApiResponse>(
    "respond-team-recruitment-application",
    {
      application_id: applicationId,
      decision,
    },
  );

  return assertSuccess(response, "Recruitment application response returned no data.");
}
export async function requestTeamAssetUpload(
  input: RequestTeamAssetUploadInput,
): Promise<RequestTeamAssetUploadResult> {
  const response = await invokeFunction<RequestTeamAssetUploadApiResponse>("upload-team-asset", {
    file_name: input.fileName,
    content_type: input.contentType,
    kind: input.kind,
  });

  return assertSuccess(response, "Failed to request team asset upload URL.");
}

export async function uploadTeamAssetToSignedUrl(
  uploadUrl: string,
  contentType: SupportedTeamAssetContentType,
  fileBody: Blob,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
    },
    body: fileBody as unknown as BodyInit,
  });

  if (!response.ok) {
    throw new Error(`Team asset upload failed with HTTP ${response.status}.`);
  }
}

export async function uploadTeamAsset(input: UploadTeamAssetInput): Promise<RequestTeamAssetUploadResult> {
  const uploadRequest = await requestTeamAssetUpload({
    fileName: input.fileName,
    contentType: input.contentType,
    kind: input.kind,
  });
  const fileBody = await readFileBlob(input.uri);

  await uploadTeamAssetToSignedUrl(uploadRequest.upload_url, input.contentType, fileBody);

  return uploadRequest;
}

export async function updateTeam(input: UpdateTeamInput): Promise<UpdateTeamResult> {
  const response = await invokeFunction<UpdateTeamApiResponse>("update-team", {
    team_id: input.teamId,
    name: input.name,
    description: input.description,
    emblem_url: input.emblemUrl,
    is_recruiting: input.isRecruiting,
    province_code: input.provinceCode,
    district_code: input.districtCode,
  });

  return assertSuccess(response, "Team update returned no data.");
}

export async function createTeam(input: CreateTeamInput): Promise<CreateTeamResult> {
  const response = await invokeFunction<ApiResponse<CreateTeamResult>>("create-team", {
    name: input.name,
    sport_type: input.sportType,
    founded_date: input.foundedDate,
    province_code: input.provinceCode,
    district_code: input.districtCode,
    home_ground: input.homeGround,
    gender_type: input.genderType,
    age_groups: input.ageGroups,
    uniform_colors: input.uniformColors,
    emblem_url: input.emblemUrl,
    match_days: input.matchDays,
    match_times: input.matchTimes,
    photo_url: input.photoUrl,
    description: input.description,
    monthly_fee: input.monthlyFee,
    formation_a: input.formationA,
    formation_b: input.formationB,
    tactic_style: input.tacticStyle,
    attack_direction: input.attackDirection,
    defense_style: input.defenseStyle,
    visibility: input.visibility,
  });

  return assertSuccess(response, "Team creation returned no data.");
}

export async function createTeamInvite(teamId: string): Promise<CreateTeamInviteResult> {
  const response = await invokeFunction<CreateTeamInviteApiResponse>("create-team-invite", {
    team_id: teamId,
  });

  return assertSuccess(response, "Team invite creation returned no data.");
}

export async function joinTeam(inviteCode: string): Promise<JoinTeamResult> {
  const response = await invokeFunction<JoinTeamApiResponse>("join-team", {
    invite_code: inviteCode,
  });

  return assertSuccess(response, "Join team returned no data.");
}

export async function updateTeamMemberRole(input: UpdateTeamMemberRoleInput): Promise<UpdateTeamMemberRoleResult> {
  const response = await invokeFunction<ApiResponse<UpdateTeamMemberRoleResult>>("update-team-member-role", {
    team_id: input.teamId,
    target_user_id: input.targetUserId,
    role: input.role,
    squad_number: input.squadNumber,
  });

  return assertSuccess(response, "Team member role update returned no data.");
}

export async function kickTeamMember(input: KickTeamMemberInput): Promise<KickTeamMemberResult> {
  const response = await invokeFunction<KickTeamMemberApiResponse>("kick-team-member", {
    team_id: input.teamId,
    target_user_id: input.targetUserId,
    reason: input.reason,
  });

  return assertSuccess(response, "Kick team member returned no data.");
}

export async function searchPublicTeams(keyword?: string): Promise<TeamRecord[]> {
  const normalizedKeyword = keyword?.trim() ?? "";
  let query = supabase
    .from("teams")
    .select(TEAM_SELECT_COLUMNS)
    .eq("visibility", "public")
    .order("name", { ascending: true })
    .limit(40);

  if (normalizedKeyword.length > 0) {
    query = query.ilike("name", `%${normalizedKeyword}%`);
  }

  const result = await query;

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []) as TeamRecord[];
}

