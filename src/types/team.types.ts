import type { ApiResponse, SupportedAvatarContentType, SupportedVisibility } from "./profile.types";

export type TeamMemberRole = "owner" | "manager" | "captain" | "player";
export type TeamMemberStatus = "pending" | "active" | "left" | "banned";
export type TeamSportType = "soccer" | "futsal" | "both";
export type TeamGenderType = "male" | "female" | "mixed";
export type TeamAgeGroup = "10s" | "20s" | "30s" | "40s" | "50s" | "60_plus";
export type TeamMatchDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type TeamMatchTime = "dawn" | "morning" | "day" | "evening" | "night";
export type TeamFormation = "4-3-3" | "4-4-2" | "4-2-3-1" | "3-5-2" | "5-3-2" | "3-4-3" | "other";
export type TeamTacticStyle = "build_up" | "counter_attack" | "balanced";
export type TeamAttackDirection = "center" | "both_sides" | "left_side" | "right_side";
export type TeamDefenseStyle = "man_to_man" | "zone" | "balanced";
export type TeamRecruitmentStatus = "open" | "closed" | "invite_only";
export type TeamUniformColor =
  | "dark_red"
  | "red"
  | "orange"
  | "yellow"
  | "dark_green"
  | "green"
  | "light_green"
  | "navy"
  | "blue"
  | "sky"
  | "purple"
  | "black"
  | "gray"
  | "white";
export type TeamAssetKind = "emblem" | "photo";
export type SupportedTeamAssetContentType = SupportedAvatarContentType;
export type ManageableTeamMemberRole = Extract<TeamMemberRole, "manager" | "captain" | "player">;
export type RecruitmentApplicationStatus = "pending" | "accepted" | "rejected";
export type RecruitmentDecision = Extract<RecruitmentApplicationStatus, "accepted" | "rejected">;

export type TeamRecord = {
  id: string;
  name: string;
  slug: string;
  emblem_url: string | null;
  photo_url: string | null;
  country_code: string;
  province_code: string;
  district_code: string;
  home_ground: string | null;
  description: string | null;
  visibility: SupportedVisibility;
  is_recruiting: boolean;
  recruitment_status: TeamRecruitmentStatus;
  sport_type: TeamSportType | null;
  founded_date: string | null;
  gender_type: TeamGenderType | null;
  age_groups: TeamAgeGroup[];
  uniform_colors: TeamUniformColor[];
  match_days: TeamMatchDay[];
  match_times: TeamMatchTime[];
  monthly_fee: number | null;
  formation_a: TeamFormation | null;
  formation_b: TeamFormation | null;
  tactic_style: TeamTacticStyle | null;
  attack_direction: TeamAttackDirection | null;
  defense_style: TeamDefenseStyle | null;
};

export type TeamMembershipRecord = {
  id: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  joined_at: string | null;
  team: TeamRecord;
};

export type TeamMemberProfileRecord = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  visibility: SupportedVisibility | null;
};

export type TeamRosterMemberRecord = {
  id: string;
  user_id: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  joined_at: string | null;
  squad_number: number | null;
  profile: TeamMemberProfileRecord | null;
};

export type TeamDetailRecord = {
  team: TeamRecord;
  currentMembership: TeamMembershipRecord | null;
  members: TeamRosterMemberRecord[];
};

export type TeamMembersQueryResult = {
  currentRole: TeamMemberRole | null;
  members: TeamRosterMemberRecord[];
};

export type CreateTeamInput = {
  name: string;
  sportType: TeamSportType;
  foundedDate: string;
  provinceCode: string;
  districtCode: string;
  homeGround: string;
  genderType: TeamGenderType;
  ageGroups: TeamAgeGroup[];
  uniformColors: TeamUniformColor[];
  emblemUrl: string | null;
  matchDays: TeamMatchDay[];
  matchTimes: TeamMatchTime[];
  photoUrl: string | null;
  description: string;
  monthlyFee: number | null;
  formationA: TeamFormation;
  formationB: TeamFormation;
  tacticStyle: TeamTacticStyle;
  attackDirection: TeamAttackDirection;
  defenseStyle: TeamDefenseStyle;
  visibility: SupportedVisibility;
};

export type CreateTeamResult = {
  team_id: string;
  slug: string;
  member_role: TeamMemberRole;
};

export type CreateTeamInviteResult = {
  invite_id: string;
  team_id: string;
  invite_code: string;
  expires_at: string | null;
};

export type JoinTeamResult = {
  team_id: string;
  joined_role: TeamMemberRole;
};

export type RequestTeamAssetUploadInput = {
  fileName: string;
  contentType: SupportedTeamAssetContentType;
  kind: TeamAssetKind;
};

export type RequestTeamAssetUploadResult = {
  upload_url: string;
  asset_url: string;
  storage_path: string;
  file_name: string;
  kind: TeamAssetKind;
};

export type UploadTeamAssetInput = {
  uri: string;
  fileName: string;
  contentType: SupportedTeamAssetContentType;
  kind: TeamAssetKind;
};

export type UpdateTeamMemberRoleInput = {
  teamId: string;
  targetUserId: string;
  role: ManageableTeamMemberRole;
  squadNumber: number | null;
};

export type UpdateTeamMemberRoleResult = {
  team_member_id: string;
  team_id: string;
  target_user_id: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  squad_number: number | null;
};

export type KickTeamMemberInput = {
  teamId: string;
  targetUserId: string;
  reason: string;
};

export type KickTeamMemberResult = {
  team_member_id: string;
  team_id: string;
  target_user_id: string;
  status: TeamMemberStatus;
  kicked_at: string | null;
};

export type TeamAnnouncement = {
  id: string;
  team_id: string;
  author_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
  created_at: string;
  author_display_name?: string | null;
};

export type TeamRecruitmentPost = {
  id: string;
  team_id: string;
  title: string;
  body: string;
  created_at: string;
  created_by: string | null;
};

export type RecruitmentApplication = {
  id: string;
  post_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_avatar_url: string | null;
  message: string;
  status: RecruitmentApplicationStatus;
  created_at: string;
};

export type CreateAnnouncementRequest = {
  team_id: string;
  title: string;
  body: string;
  is_pinned: boolean;
};

export type TogglePinRequest = {
  announcement_id: string;
};

export type UpdateRecruitmentStatusRequest = {
  team_id: string;
  recruitment_status: TeamRecruitmentStatus;
};

export type ToggleRecruitmentStatusInput = {
  teamId: string;
  recruitmentStatus: TeamRecruitmentStatus;
};

export type RespondRecruitmentApplicationRequest = {
  application_id: string;
  decision: RecruitmentDecision;
};

export type UpdateTeamInput = {
  teamId: string;
  name: string;
  description: string;
  emblemUrl: string | null;
  isRecruiting: boolean;
  provinceCode: string;
  districtCode: string;
};

export type UpdateTeamResult = {
  team_id: string;
  name: string;
  description: string | null;
  emblem_url: string | null;
  is_recruiting: boolean;
  recruitment_status: TeamRecruitmentStatus;
  province_code: string;
  district_code: string;
};

export type CreateTeamApiResponse = ApiResponse<CreateTeamResult>;
export type CreateTeamInviteApiResponse = ApiResponse<CreateTeamInviteResult>;
export type JoinTeamApiResponse = ApiResponse<JoinTeamResult>;
export type RequestTeamAssetUploadApiResponse = ApiResponse<RequestTeamAssetUploadResult>;
export type KickTeamMemberApiResponse = ApiResponse<KickTeamMemberResult>;
export type CreateTeamAnnouncementApiResponse = ApiResponse<TeamAnnouncement>;
export type ToggleAnnouncementPinApiResponse = ApiResponse<TeamAnnouncement>;
export type UpdateTeamApiResponse = ApiResponse<UpdateTeamResult>;
export type UpdateRecruitmentStatusApiResponse = ApiResponse<TeamRecord>;
export type RespondRecruitmentApplicationApiResponse = ApiResponse<RecruitmentApplication>;


