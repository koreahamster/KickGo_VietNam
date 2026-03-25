import { supabase } from "@/lib/supabase";
import { getTeamMatches } from "@/services/match.service";
import { getMyTeams } from "@/services/team.service";
import type { AttendanceResponse, MatchStatus, TeamMatchSummaryRecord } from "@/types/match.types";
import type {
  HomeBannerRecord,
  HomeNextMatchRecord,
  HomePendingActionRecord,
  HomeRecentResultRecord,
  HomeRegionRankRecord,
  HomeShortRecord,
} from "@/types/home.types";
import type { TeamMembershipRecord } from "@/types/team.types";

type BannerRow = Record<string, unknown>;
type AttendanceVoteLookupRow = {
  poll_id: string;
  response: AttendanceResponse;
};

type TeamMembersLookupRow = {
  team_id: string;
};

type MatchWithMembership = {
  membership: TeamMembershipRecord;
  summary: TeamMatchSummaryRecord;
};

const UPCOMING_STATUSES: MatchStatus[] = ["scheduled", "ongoing", "awaiting_confirmation", "awaiting_result"];
const FINAL_STATUSES: MatchStatus[] = ["finalized", "auto_finalized"];
const MVP_WINDOW_MS = 24 * 60 * 60 * 1000;

const FALLBACK_BANNERS: HomeBannerRecord[] = [
  {
    id: "banner-fallback-1",
    title: "KickGo Match Day",
    subtitle: "Create the next match with your squad.",
    image_url: null,
    fallback_asset: "main",
    type: "notice",
    target_url: "/notifications",
  },
  {
    id: "banner-fallback-2",
    title: "Recruit the right players",
    subtitle: "Open mercenary posts and grow your matchday roster.",
    image_url: null,
    fallback_asset: "main",
    type: "event",
    target_url: "/mercenary-posts",
  },
  {
    id: "banner-fallback-3",
    title: "KickGo Shop",
    subtitle: "Browse new club gear and essentials.",
    image_url: null,
    fallback_asset: "main",
    type: "external",
    target_url: "https://kickgo.app",
  },
];

const FALLBACK_SHORTS: HomeShortRecord[] = [
  { id: "short-1", title: "KickGo short 1", views: 1280, image_url: null, fallback_asset: "main" },
  { id: "short-2", title: "KickGo short 2", views: 940, image_url: null, fallback_asset: "main" },
  { id: "short-3", title: "KickGo short 3", views: 802, image_url: null, fallback_asset: "main" },
];

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

function uniqueMatches(rows: MatchWithMembership[]): MatchWithMembership[] {
  const seen = new Set<string>();
  const unique: MatchWithMembership[] = [];

  rows.forEach((row) => {
    if (seen.has(row.summary.match.id)) {
      return;
    }

    seen.add(row.summary.match.id);
    unique.push(row);
  });

  return unique;
}

async function getMemberCounts(teamIds: string[]): Promise<Record<string, number>> {
  if (teamIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("team_members")
    .select("team_id")
    .in("team_id", teamIds)
    .eq("status", "active");

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as TeamMembersLookupRow[]).reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.team_id] = (accumulator[row.team_id] ?? 0) + 1;
    return accumulator;
  }, {});
}

async function getMyResponsesByPollIds(
  pollIds: string[],
  userId: string,
): Promise<Record<string, AttendanceResponse>> {
  if (pollIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("attendance_votes")
    .select("poll_id, response")
    .in("poll_id", pollIds)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as AttendanceVoteLookupRow[]).reduce<Record<string, AttendanceResponse>>((accumulator, row) => {
    accumulator[row.poll_id] = row.response;
    return accumulator;
  }, {});
}

function getDaysUntil(scheduledAt: string): number {
  const now = new Date();
  const scheduled = new Date(scheduledAt);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(scheduled.getFullYear(), scheduled.getMonth(), scheduled.getDate()).getTime();
  return Math.round((target - start) / (24 * 60 * 60 * 1000));
}

async function getMatchBundle(userId?: string): Promise<{
  userId: string;
  memberships: TeamMembershipRecord[];
  matches: MatchWithMembership[];
  memberCounts: Record<string, number>;
  myResponses: Record<string, AttendanceResponse>;
}> {
  const resolvedUserId = userId ?? (await getAuthenticatedUserId());
  const memberships = await getMyTeams();

  if (memberships.length === 0) {
    return {
      userId: resolvedUserId,
      memberships,
      matches: [],
      memberCounts: {},
      myResponses: {},
    };
  }

  const matchLists = await Promise.all(
    memberships.map(async (membership) => ({
      membership,
      matches: await getTeamMatches(membership.team.id),
    })),
  );

  const merged = uniqueMatches(
    matchLists.flatMap((entry) => entry.matches.map((summary) => ({ membership: entry.membership, summary }))),
  );

  const memberCounts = await getMemberCounts(memberships.map((membership) => membership.team.id));
  const myResponses = await getMyResponsesByPollIds(
    merged
      .map((entry) => entry.summary.attendancePoll?.id ?? null)
      .filter((value): value is string => Boolean(value)),
    resolvedUserId,
  );

  return {
    userId: resolvedUserId,
    memberships,
    matches: merged,
    memberCounts,
    myResponses,
  };
}

export async function getBanners(): Promise<HomeBannerRecord[]> {
  try {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as BannerRow[];

    if (rows.length === 0) {
      return FALLBACK_BANNERS;
    }

    return rows.map((row, index) => {
      const type = row.type === "external" || row.type === "event" ? row.type : "notice";
      return {
        id: String(row.id ?? `banner-${index}`),
        title: typeof row.title === "string" && row.title.trim() ? row.title : "KickGo",
        subtitle: typeof row.subtitle === "string" && row.subtitle.trim() ? row.subtitle : null,
        image_url: typeof row.image_url === "string" ? row.image_url : null,
        fallback_asset: typeof row.image_url === "string" && row.image_url.trim() ? null : "main",
        type,
        target_url:
          typeof row.target_url === "string"
            ? row.target_url
            : typeof row.external_url === "string"
              ? row.external_url
              : null,
      } satisfies HomeBannerRecord;
    });
  } catch {
    return FALLBACK_BANNERS;
  }
}

export async function getHomeMyTeams(userId?: string): Promise<TeamMembershipRecord[]> {
  const bundle = await getMatchBundle(userId);
  return bundle.memberships;
}

export async function getNextMatch(userId?: string): Promise<HomeNextMatchRecord | null> {
  const bundle = await getMatchBundle(userId);
  const upcoming = bundle.matches
    .filter((entry) => UPCOMING_STATUSES.includes(entry.summary.match.status))
    .sort((left, right) => new Date(left.summary.match.scheduled_at).getTime() - new Date(right.summary.match.scheduled_at).getTime());

  const next = upcoming[0];

  if (!next) {
    return null;
  }

  const pollId = next.summary.attendancePoll?.id ?? null;
  const myResponse = pollId ? bundle.myResponses[pollId] ?? null : null;
  const respondedCount = next.summary.attendanceSummary.yes + next.summary.attendanceSummary.no + next.summary.attendanceSummary.late;

  return {
    summary: next.summary,
    membership: next.membership,
    my_response: myResponse,
    active_member_count: bundle.memberCounts[next.membership.team.id] ?? 0,
    responded_count: respondedCount,
    days_until: getDaysUntil(next.summary.match.scheduled_at),
  };
}

export async function getPendingActions(userId?: string): Promise<HomePendingActionRecord[]> {
  const bundle = await getMatchBundle(userId);
  const now = Date.now();
  const actions: HomePendingActionRecord[] = [];

  bundle.matches.forEach((entry) => {
    const pollId = entry.summary.attendancePoll?.id ?? null;
    const myResponse = pollId ? bundle.myResponses[pollId] ?? null : null;
    const opponentName = entry.summary.opponentDisplayName;

    if (pollId && !myResponse) {
      const deadline = entry.summary.attendancePoll?.deadline_at ? new Date(entry.summary.attendancePoll.deadline_at).getTime() : null;
      const hoursLeft = deadline ? Math.max(0, Math.ceil((deadline - now) / (60 * 60 * 1000))) : null;
      actions.push({
        id: `attendance-${entry.summary.match.id}`,
        type: "attendance",
        team_name: entry.membership.team.name,
        opponent_name: opponentName,
        match_id: entry.summary.match.id,
        hours_left: hoursLeft,
      });
    }

    if (entry.summary.match.status === "awaiting_confirmation" || entry.summary.match.status === "awaiting_result") {
      actions.push({
        id: `result-${entry.summary.match.id}`,
        type: "result",
        team_name: entry.membership.team.name,
        opponent_name: opponentName,
        match_id: entry.summary.match.id,
        hours_left: null,
      });
    }

    const finalizedAt = new Date(entry.summary.match.scheduled_at).getTime();
    if (FINAL_STATUSES.includes(entry.summary.match.status) && now - finalizedAt <= MVP_WINDOW_MS) {
      const hoursLeft = Math.max(0, Math.ceil((MVP_WINDOW_MS - (now - finalizedAt)) / (60 * 60 * 1000)));
      actions.push({
        id: `mvp-${entry.summary.match.id}`,
        type: "mvp",
        team_name: entry.membership.team.name,
        opponent_name: opponentName,
        match_id: entry.summary.match.id,
        hours_left: hoursLeft,
      });
    }
  });

  return actions
    .sort((left, right) => {
      const leftHours = left.hours_left ?? Number.MAX_SAFE_INTEGER;
      const rightHours = right.hours_left ?? Number.MAX_SAFE_INTEGER;
      return leftHours - rightHours;
    })
    .slice(0, 6);
}

export async function getRecentResults(userId?: string): Promise<HomeRecentResultRecord[]> {
  const bundle = await getMatchBundle(userId);

  return bundle.matches
    .filter((entry) => FINAL_STATUSES.includes(entry.summary.match.status))
    .sort((left, right) => new Date(right.summary.match.scheduled_at).getTime() - new Date(left.summary.match.scheduled_at).getTime())
    .slice(0, 2)
    .map((entry) => ({
      id: entry.summary.match.id,
      summary: entry.summary,
      score_label: "VS",
    }));
}

export async function getRegionRank(userId?: string): Promise<HomeRegionRankRecord | null> {
  const bundle = await getMatchBundle(userId);
  const membership = bundle.memberships[0];

  if (!membership) {
    return null;
  }

  const seed = membership.team.name.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const points = 35 + (seed % 51);
  const totalTeams = 10 + (seed % 9);
  const rank = Math.max(1, Math.min(totalTeams, Math.ceil((100 - points) / 15)));
  const tierLabel = points >= 80 ? "Gold" : points >= 60 ? "Silver" : "Bronze";

  return {
    team_id: membership.team.id,
    team_name: membership.team.name,
    tier_label: tierLabel,
    rank,
    total_teams: totalTeams,
    points,
    progress: Math.min(100, points),
  };
}

export async function getPopularShorts(): Promise<HomeShortRecord[]> {
  return FALLBACK_SHORTS;
}