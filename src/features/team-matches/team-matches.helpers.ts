import type { SelectOption } from "@/constants/profile-options";
import type { TeamMatchesCopy } from "@/features/team-matches.copy";
import type {
  AttendanceVoteRecord,
  MatchStatus,
  MatchType,
  TeamMatchSummaryRecord,
  TournamentBracket,
  TournamentStatus,
} from "@/types/match.types";
import type { SupportedLanguage } from "@/types/profile.types";

export type MonthGridCell = {
  key: string;
  isoDate: string | null;
  dayNumber: string;
  hasMatch: boolean;
  isToday: boolean;
};

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function toLocalDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getLocale(language: SupportedLanguage): string {
  if (language === "ko") {
    return "ko-KR";
  }
  if (language === "vi") {
    return "vi-VN";
  }
  return "en-US";
}

export function getWeekdayLabels(copy: TeamMatchesCopy): string[] {
  return [
    copy.calendarWeekSun,
    copy.calendarWeekMon,
    copy.calendarWeekTue,
    copy.calendarWeekWed,
    copy.calendarWeekThu,
    copy.calendarWeekFri,
    copy.calendarWeekSat,
  ];
}

export function formatMonthTitle(year: number, month: number, language: SupportedLanguage): string {
  return new Intl.DateTimeFormat(getLocale(language), {
    year: "numeric",
    month: "long",
  }).format(new Date(year, month - 1, 1));
}

export function formatMatchDateTime(value: string, language: SupportedLanguage): string {
  return new Intl.DateTimeFormat(getLocale(language), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDateOnly(value: string, language: SupportedLanguage): string {
  return new Intl.DateTimeFormat(getLocale(language), {
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function formatMonthDayLabel(value: string, language: SupportedLanguage): string {
  return new Intl.DateTimeFormat(getLocale(language), {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(new Date(value));
}

export function formatScoreboardDateTime(value: string, language: SupportedLanguage): string {
  return new Intl.DateTimeFormat(getLocale(language), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function buildMonthGrid(year: number, month: number, matches: TeamMatchSummaryRecord[]): MonthGridCell[] {
  const firstDay = new Date(year, month - 1, 1);
  const totalDays = new Date(year, month, 0).getDate();
  const leadingEmpty = firstDay.getDay();
  const cells: MonthGridCell[] = [];
  const todayKey = toLocalDateKey(new Date());
  const matchDateSet = new Set(matches.map((item) => toLocalDateKey(new Date(item.match.scheduled_at))));

  for (let index = 0; index < leadingEmpty; index += 1) {
    cells.push({
      key: `empty-start-${index}`,
      isoDate: null,
      dayNumber: "",
      hasMatch: false,
      isToday: false,
    });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month - 1, day);
    const isoDate = toLocalDateKey(date);
    cells.push({
      key: isoDate,
      isoDate,
      dayNumber: String(day),
      hasMatch: matchDateSet.has(isoDate),
      isToday: isoDate === todayKey,
    });
  }

  const trailingEmpty = (7 - (cells.length % 7)) % 7;
  for (let index = 0; index < trailingEmpty; index += 1) {
    cells.push({
      key: `empty-end-${index}`,
      isoDate: null,
      dayNumber: "",
      hasMatch: false,
      isToday: false,
    });
  }

  return cells;
}

export function groupMatchesByDate(matches: TeamMatchSummaryRecord[]): Record<string, TeamMatchSummaryRecord[]> {
  return matches.reduce<Record<string, TeamMatchSummaryRecord[]>>((accumulator, item) => {
    const key = toLocalDateKey(new Date(item.match.scheduled_at));
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(item);
    return accumulator;
  }, {});
}

export function getMatchTypeLabel(copy: TeamMatchesCopy, matchType: MatchType): string {
  switch (matchType) {
    case "league":
      return copy.typeLeague;
    case "tournament":
      return copy.typeTournament;
    default:
      return copy.typeFriendly;
  }
}

export function getMatchStatusLabel(copy: TeamMatchesCopy, status: MatchStatus): string {
  switch (status) {
    case "ongoing":
      return copy.statusOngoing;
    case "finished":
      return copy.statusFinished;
    case "cancelled":
      return copy.statusCancelled;
    case "disputed":
      return copy.statusDisputed;
    case "finalized":
      return copy.statusFinalized;
    case "awaiting_confirmation":
      return copy.statusAwaitingConfirmation;
    case "awaiting_result":
      return copy.statusAwaitingResult;
    case "auto_finalized":
      return copy.statusAutoFinalized;
    default:
      return copy.statusScheduled;
  }
}

export function getMatchStatusTone(status: MatchStatus): { backgroundColor: string; color: string } {
  switch (status) {
    case "ongoing":
      return { backgroundColor: "#dcfce7", color: "#166534" };
    case "finished":
    case "finalized":
    case "auto_finalized":
      return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
    case "cancelled":
      return { backgroundColor: "#fee2e2", color: "#b91c1c" };
    case "disputed":
      return { backgroundColor: "#ede9fe", color: "#6d28d9" };
    case "awaiting_confirmation":
    case "awaiting_result":
      return { backgroundColor: "#fef3c7", color: "#b45309" };
    default:
      return { backgroundColor: "#f3f4f6", color: "#4b5563" };
  }
}

export function getTournamentStatusLabel(copy: TeamMatchesCopy, status: TournamentStatus): string {
  switch (status) {
    case "in_progress":
      return copy.tournamentStatusInProgress;
    case "finished":
      return copy.tournamentStatusFinished;
    default:
      return copy.tournamentStatusOpen;
  }
}

export function getTournamentStatusTone(status: TournamentStatus): { backgroundColor: string; color: string } {
  switch (status) {
    case "in_progress":
      return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
    case "finished":
      return { backgroundColor: "#ecfccb", color: "#3f6212" };
    default:
      return { backgroundColor: "#f3f4f6", color: "#4b5563" };
  }
}

export function buildDateOptions(language: SupportedLanguage, daysAhead = 60): SelectOption[] {
  return Array.from({ length: daysAhead }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const isoDate = toLocalDateKey(date);
    const label = new Intl.DateTimeFormat(getLocale(language), {
      month: "short",
      day: "numeric",
      weekday: "short",
    }).format(date);

    return { label, value: isoDate };
  });
}

export function buildTimeOptions(): SelectOption[] {
  const options: SelectOption[] = [];
  for (let hour = 6; hour <= 23; hour += 1) {
    for (const minute of [0, 30]) {
      const label = `${pad(hour)}:${pad(minute)}`;
      options.push({ label, value: label });
    }
  }
  return options;
}

export function combineScheduledAt(dateValue: string, timeValue: string): string {
  return new Date(`${dateValue}T${timeValue}:00`).toISOString();
}

export function buildDdayLabel(copy: TeamMatchesCopy, scheduledAt: string): string {
  const target = new Date(scheduledAt);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const targetStart = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const diff = Math.round((targetStart - start) / 86400000);

  if (diff <= 0) {
    return copy.today;
  }
  if (diff === 1) {
    return copy.tomorrow;
  }
  return `${copy.ddayPrefix}${diff}`;
}

export function summarizeVotes(votes: AttendanceVoteRecord[]): {
  yes: number;
  no: number;
  maybe: number;
} {
  return votes.reduce(
    (accumulator, vote) => {
      if (vote.response === "yes") {
        accumulator.yes += 1;
      } else if (vote.response === "no") {
        accumulator.no += 1;
      } else if (vote.response === "maybe") {
        accumulator.maybe += 1;
      }
      return accumulator;
    },
    { yes: 0, no: 0, maybe: 0 },
  );
}

export function isFutureScheduledAt(value: string): boolean {
  return new Date(value).getTime() > Date.now();
}

export function getDisplayScore(value: number | null): string {
  if (typeof value === "number") {
    return String(value);
  }
  return "0";
}

export function getMatchDayKey(value: string): string {
  return toLocalDateKey(new Date(value));
}

export function buildTournamentSections(brackets: TournamentBracket[]): {
  semifinal: TournamentBracket[];
  final: TournamentBracket[];
} {
  return {
    semifinal: brackets.filter((item) => item.round === 1).sort((left, right) => left.match_order - right.match_order),
    final: brackets.filter((item) => item.round === 2).sort((left, right) => left.match_order - right.match_order),
  };
}