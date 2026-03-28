import type { ApiResponse } from "./profile.types";

export type RefereeAssignmentStatus = "pending" | "accepted" | "rejected" | "completed" | "cancelled";
export type RespondAssignmentDecision = "accept" | "reject";

export type RefereeAvailability = {
  id: string;
  referee_id: string;
  available_date: string;
  start_time: string;
  end_time: string;
  province_code: string;
  is_booked: boolean;
  created_at: string;
  referee_name?: string;
  referee_avatar_url?: string | null;
  referee_rating?: number | null;
};

export type RefereeAssignment = {
  id: string;
  match_id: string;
  referee_id: string;
  requesting_team_id: string;
  fee_amount: number;
  status: RefereeAssignmentStatus;
  requested_at: string;
  responded_at: string | null;
  created_at: string;
  referee_name?: string;
  referee_avatar_url?: string | null;
  match_scheduled_at?: string | null;
  home_team_name?: string;
  away_team_name?: string;
  venue_name?: string | null;
  requesting_team_name?: string;
};

export type RefereePaymentRecord = {
  id: string;
  assignment_id: string;
  fee_amount: number;
  note: string | null;
  paid_at: string;
  created_by: string;
};

export type MatchRoster = {
  id: string;
  match_id: string;
  team_id: string;
  user_id: string;
  squad_number: number | null;
  position: string | null;
  is_mercenary: boolean;
  created_at: string;
  player_name?: string;
  player_avatar_url?: string | null;
};

export type RefereeRating = {
  id: string;
  match_id: string;
  assignment_id: string;
  rated_by: string;
  score_fairness: number;
  score_accuracy: number;
  score_attitude: number;
  overall_score: number;
  comment: string | null;
  created_at: string;
};

export type RegisterAvailabilityRequest = {
  available_date: string;
  start_time: string;
  end_time: string;
  province_code: string;
};

export type RequestAssignmentRequest = {
  match_id: string;
  referee_id: string;
  fee_amount: number;
};

export type RespondAssignmentRequest = {
  assignment_id: string;
  decision: RespondAssignmentDecision;
};

export type SubmitRosterPlayer = {
  user_id: string;
  squad_number: number | null;
  position: string | null;
  is_mercenary: boolean;
};

export type SubmitRosterRequest = {
  match_id: string;
  team_id: string;
  players: SubmitRosterPlayer[];
};

export type ConfirmRosterRequest = {
  match_id: string;
};

export type RecordPaymentRequest = {
  assignment_id: string;
  fee_amount: number;
  note?: string | null;
};

export type RateRefereeRequest = {
  match_id: string;
  assignment_id: string;
  score_fairness: number;
  score_accuracy: number;
  score_attitude: number;
  overall_score: number;
  comment?: string | null;
};

export type DeleteAvailabilityRequest = {
  availabilityId: string;
};

export type RegisterAvailabilityApiResponse = ApiResponse<RefereeAvailability>;
export type RequestAssignmentApiResponse = ApiResponse<RefereeAssignment>;
export type RespondAssignmentApiResponse = ApiResponse<RefereeAssignment>;
export type SubmitRosterApiResponse = ApiResponse<MatchRoster[]>;
export type ConfirmRosterApiResponse = ApiResponse<{ match_id: string; status: string }>;
export type RecordPaymentApiResponse = ApiResponse<RefereePaymentRecord>;
export type RateRefereeApiResponse = ApiResponse<RefereeRating>;
