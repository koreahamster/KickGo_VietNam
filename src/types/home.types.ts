import type { TeamMatchSummaryRecord } from "@/types/match.types";
import type { TeamMembershipRecord } from "@/types/team.types";

export type HomeBannerType = "notice" | "external" | "event";
export type HomeAssetKey = "main" | "logo";

export type HomeBannerRecord = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  fallback_asset: HomeAssetKey | null;
  type: HomeBannerType;
  target_url: string | null;
};

export type HomeNextMatchRecord = {
  summary: TeamMatchSummaryRecord;
  membership: TeamMembershipRecord | null;
  my_response: "yes" | "no" | "late" | "unknown" | null;
  active_member_count: number;
  responded_count: number;
  days_until: number;
};

export type HomePendingActionType = "attendance" | "result" | "mvp";

export type HomePendingActionRecord = {
  id: string;
  type: HomePendingActionType;
  team_name: string;
  opponent_name: string;
  match_id: string;
  hours_left: number | null;
};

export type HomeRecentResultRecord = {
  id: string;
  summary: TeamMatchSummaryRecord;
  score_label: string;
};

export type HomeRegionRankRecord = {
  team_id: string;
  team_name: string;
  tier_label: string;
  rank: number;
  total_teams: number;
  points: number;
  progress: number;
};

export type HomeShortRecord = {
  id: string;
  title: string;
  views: number;
  image_url: string | null;
  fallback_asset: HomeAssetKey | null;
};