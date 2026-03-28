import type { ApiResponse } from "./profile.types";

export type TeamPaymentProvider = "momo" | "zalopay" | "bank";
export type TeamFeeType = "monthly" | "per_match" | "mixed";
export type TeamFeeRecordType = "monthly" | "per_match";

export type TeamPaymentAccount = {
  id: string;
  team_id: string;
  provider: TeamPaymentProvider;
  account_name: string;
  account_number: string | null;
  qr_image_url: string | null;
  is_active: boolean;
  created_at: string;
};

export type TeamFeeSettings = {
  id: string;
  team_id: string;
  fee_type: TeamFeeType;
  monthly_amount: number;
  per_match_amount: number;
  created_at: string;
  updated_at: string;
};

export type TeamFeeRecord = {
  id: string;
  team_id: string;
  user_id: string;
  fee_type: TeamFeeRecordType;
  year_month: string | null;
  match_id: string | null;
  amount: number;
  is_paid: boolean;
  paid_at: string | null;
  confirmed_by: string | null;
  note: string | null;
  created_at: string;
  user_display_name?: string | null;
  user_avatar_url?: string | null;
};

export type TeamFeeUsage = {
  id: string;
  team_id: string;
  amount: number;
  description: string;
  used_at: string;
  created_by: string | null;
  created_at: string;
};

export type FeeStats = {
  total_collected: number;
  total_usage: number;
  balance: number;
  paid_count: number;
  unpaid_count: number;
};

export type UpdateFeeSettingsRequest = {
  team_id: string;
  fee_type: TeamFeeType;
  monthly_amount: number;
  per_match_amount: number;
};

export type RegisterPaymentAccountRequest = {
  team_id: string;
  provider: TeamPaymentProvider;
  account_name: string;
  account_number: string;
  qr_image_url: string;
};

export type ConfirmFeePaymentRequest = {
  fee_record_id?: string | null;
  team_id?: string;
  user_id?: string;
  fee_type?: TeamFeeRecordType;
  year_month?: string | null;
  match_id?: string | null;
  amount?: number;
  note: string;
};

export type RecordFeeUsageRequest = {
  team_id: string;
  amount: number;
  description: string;
  used_at: string;
};

export type UploadFeeQrRequest = {
  team_id: string;
  provider: TeamPaymentProvider;
  file_name: string;
  content_type: "image/jpeg" | "image/png";
  base64_data: string;
};

export type UploadFeeQrResult = {
  qr_image_url: string;
  storage_path: string;
  provider: TeamPaymentProvider;
};

export type TeamFeeSettingsApiResponse = ApiResponse<TeamFeeSettings>;
export type TeamPaymentAccountApiResponse = ApiResponse<TeamPaymentAccount>;
export type TeamFeeRecordApiResponse = ApiResponse<TeamFeeRecord>;
export type TeamFeeUsageApiResponse = ApiResponse<TeamFeeUsage>;
export type UploadFeeQrApiResponse = ApiResponse<UploadFeeQrResult>;
