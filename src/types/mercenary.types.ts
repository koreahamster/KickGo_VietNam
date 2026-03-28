import type { ApiResponse, PlayerPosition } from "@/types/profile.types";

export type MercenaryPostStatus = "open" | "closed" | "cancelled";
export type MercenaryApplicationStatus = "pending" | "accepted" | "rejected";
export type MercenaryDecision = "accept" | "reject";
export type MercenaryPositionFilter = "GK" | "DF" | "MF" | "FW";

export type MercenaryPost = {
  id: string;
  team_id: string;
  match_id: string | null;
  needed_positions: PlayerPosition[];
  needed_count: number;
  province_code: string;
  description: string | null;
  status: MercenaryPostStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  team_name?: string;
  team_emblem_url?: string | null;
  team_district_code?: string | null;
  match_scheduled_at?: string | null;
  match_venue_name?: string | null;
  accepted_count?: number;
};

export type MercenaryApplication = {
  id: string;
  post_id: string;
  applicant_id: string;
  message: string | null;
  status: MercenaryApplicationStatus;
  created_at: string;
  applicant_name?: string;
  applicant_avatar_url?: string | null;
  applicant_positions?: PlayerPosition[];
  team_name?: string;
  team_emblem_url?: string | null;
  needed_positions?: PlayerPosition[];
  match_scheduled_at?: string | null;
};

export type MercenaryPostDetail = {
  post: MercenaryPost;
  applications: MercenaryApplication[];
};

export type CreateMercenaryPostRequest = {
  team_id: string;
  match_id?: string | null;
  needed_positions: PlayerPosition[];
  needed_count: number;
  province_code: string;
  description?: string | null;
};

export type ApplyMercenaryRequest = {
  post_id: string;
  message?: string | null;
};

export type RespondMercenaryRequest = {
  application_id: string;
  decision: MercenaryDecision;
};

export type CloseMercenaryPostRequest = {
  post_id: string;
};

export type CreateMercenaryPostApiResponse = ApiResponse<MercenaryPost>;
export type ApplyMercenaryApiResponse = ApiResponse<MercenaryApplication>;
export type RespondMercenaryApiResponse = ApiResponse<MercenaryApplication>;
export type CloseMercenaryPostApiResponse = ApiResponse<MercenaryPost>;