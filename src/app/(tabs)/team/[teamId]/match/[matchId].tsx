
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getRefereeAssignmentStatusLabel, getRefereeAssignmentTone, getRefereeSystemCopy } from "@/features/referee/referee.copy";
import { getTeamMatchesCopy } from "@/features/team-matches.copy";
import { TeamMatchInlineHeader } from "@/features/team-matches/components/TeamMatchInlineHeader";
import { formatMatchDateTime, getMatchStatusLabel, getMatchStatusTone, getMatchTypeLabel } from "@/features/team-matches/team-matches.helpers";
import * as useMatchQuery from "@/hooks/useMatchQuery";
import { useAuth } from "@/hooks/useAuth";
import * as useRefereeQuery from "@/hooks/useRefereeQuery";
import { useTeamDetailQuery } from "@/hooks/useTeamDetailQuery";
import { useTeamMembersQuery } from "@/hooks/useTeamMembersQuery";
import type { AttendanceResponse, AttendanceVoteRecord } from "@/types/match.types";
import type { MatchRoster, RefereeAssignmentStatus, RefereeAvailability } from "@/types/referee.types";
import type { TeamRosterMemberRecord } from "@/types/team.types";

type VoteChoice = Extract<AttendanceResponse, "yes" | "no" | "maybe">;

type MemberAttendanceRow = { member: TeamRosterMemberRecord; response: AttendanceResponse };

function normalizeVoteResponse(value: AttendanceVoteRecord | undefined): AttendanceResponse {
  if (!value) return "unknown";
  return value.response === "yes" || value.response === "no" || value.response === "maybe" ? value.response : "unknown";
}

function getResponseLabel(copy: ReturnType<typeof getTeamMatchesCopy>, response: AttendanceResponse): string {
  if (response === "yes") return copy.attendanceYes;
  if (response === "no") return copy.attendanceNo;
  if (response === "maybe") return copy.attendanceMaybe;
  return copy.attendancePending;
}

function getResponseTone(response: AttendanceResponse): { bg: string; text: string } {
  if (response === "yes") return { bg: "#dcfce7", text: "#166534" };
  if (response === "no") return { bg: "#fee2e2", text: "#b91c1c" };
  if (response === "maybe") return { bg: "#fef3c7", text: "#92400e" };
  return { bg: "#e5e7eb", text: "#475569" };
}

function getInitial(value: string | null | undefined): string {
  return value?.trim().slice(0, 1).toUpperCase() || "R";
}

function formatCurrency(amount: number, language: "ko" | "en" | "vi"): string {
  const locale = language === "ko" ? "ko-KR" : language === "vi" ? "vi-VN" : "en-US";
  return `${new Intl.NumberFormat(locale).format(amount)} VND`;
}

function buildSummary(votes: AttendanceVoteRecord[], memberCount: number) {
  return {
    yesCount: votes.filter((item) => item.response === "yes").length,
    noCount: votes.filter((item) => item.response === "no").length,
    maybeCount: votes.filter((item) => item.response === "maybe").length,
    totalCount: memberCount,
  };
}

function buildMemberRows(members: TeamRosterMemberRecord[], votes: AttendanceVoteRecord[]): MemberAttendanceRow[] {
  const voteMap = new Map<string, AttendanceVoteRecord>();
  votes.forEach((vote) => voteMap.set(vote.user_id, vote));
  return members.map((member) => ({ member, response: normalizeVoteResponse(voteMap.get(member.user_id)) }));
}

function VoteButton(props: { label: string; isActive: boolean; onPress: () => void; tone: "yes" | "no" | "maybe"; isDisabled: boolean }): JSX.Element {
  const palette = props.tone === "yes"
    ? { bg: "#dcfce7", border: "#22c55e", text: "#166534" }
    : props.tone === "no"
      ? { bg: "#fee2e2", border: "#ef4444", text: "#b91c1c" }
      : { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" };

  return (
    <Pressable disabled={props.isDisabled} onPress={props.onPress} style={[styles.voteButton, { borderColor: palette.border, backgroundColor: props.isActive ? palette.bg : "#ffffff" }, props.isDisabled ? styles.disabled : null]}>
      <Text style={[styles.voteButtonLabel, { color: palette.text }]}>{props.label}</Text>
    </Pressable>
  );
}

function RosterBlock(props: { title: string; rows: MatchRoster[]; emptyLabel: string }): JSX.Element {
  return (
    <View style={styles.rosterGroup}>
      <Text style={styles.rosterTitle}>{props.title}</Text>
      {props.rows.length > 0 ? props.rows.map((row) => (
        <View key={row.id} style={styles.rosterRow}>
          <View style={styles.rosterAvatar}><Text style={styles.rosterAvatarLabel}>{getInitial(row.player_name)}</Text></View>
          <View style={styles.rosterCopy}>
            <Text style={styles.rosterName}>{row.player_name ?? "KickGo Player"}</Text>
            <Text style={styles.rosterMeta}>{`${row.position ?? "-"}${row.squad_number ? ` · #${row.squad_number}` : ""}${row.is_mercenary ? " · M" : ""}`}</Text>
          </View>
        </View>
      )) : <Text style={styles.helperText}>{props.emptyLabel}</Text>}
    </View>
  );
}

function RatingSelector(props: { label: string; value: number; onChange: (value: number) => void }): JSX.Element {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{props.label}</Text>
      <View style={styles.ratingOptions}>
        {[1, 2, 3, 4, 5].map((score) => {
          const selected = props.value === score;
          return (
            <Pressable key={score} onPress={() => props.onChange(score)} style={[styles.ratingChip, selected ? styles.ratingChipActive : null]}>
              <Text style={[styles.ratingChipLabel, selected ? styles.ratingChipLabelActive : null]}>{score}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function MatchDetailScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamMatchesCopy(language);
  const refereeCopy = getRefereeSystemCopy(language);
  const { user } = useAuth();
  const params = useLocalSearchParams<{ teamId?: string | string[]; matchId?: string | string[] }>();
  const teamId = Array.isArray(params.teamId) ? params.teamId[0] ?? null : params.teamId ?? null;
  const matchId = Array.isArray(params.matchId) ? params.matchId[0] ?? null : params.matchId ?? null;

  const matchQuery = useMatchQuery.useMatchDetail(matchId, Boolean(matchId));
  const teamDetailQuery = useTeamDetailQuery(teamId, Boolean(teamId));
  const pollQuery = useMatchQuery.useAttendancePoll(matchId, teamId, Boolean(matchId && teamId));
  const votesQuery = useMatchQuery.useAttendanceVotes(pollQuery.data?.id ?? null, Boolean(pollQuery.data?.id));
  const membersQuery = useTeamMembersQuery(teamId, Boolean(teamId));
  const assignmentQuery = useRefereeQuery.useMatchAssignment(matchId, Boolean(matchId));
  const rostersQuery = useRefereeQuery.useMatchRosters(matchId, Boolean(matchId));
  const ratingsQuery = useRefereeQuery.useRefereeRatings(matchId, Boolean(matchId));
  const voteMutation = useMatchQuery.useVoteAttendance();
  const confirmRosterMutation = useRefereeQuery.useConfirmRoster();
  const recordPaymentMutation = useRefereeQuery.useRecordPayment();
  const rateMutation = useRefereeQuery.useRateReferee();
  const requestAssignmentMutation = useRefereeQuery.useRequestAssignment();
  const match = matchQuery.data?.match ?? null;
  const team = teamDetailQuery.data?.team ?? null;
  const currentRole = teamDetailQuery.data?.currentMembership?.role ?? null;
  const canManage = currentRole === "owner" || currentRole === "manager";
  const members = membersQuery.data?.members ?? [];
  const votes = votesQuery.data ?? [];
  const assignment = assignmentQuery.data;
  const rosters = rostersQuery.data ?? [];
  const currentTeamRoster = useMemo(() => rosters.filter((item) => item.team_id === teamId), [rosters, teamId]);
  const homeRoster = useMemo(() => rosters.filter((item) => item.team_id === match?.home_team_id), [rosters, match?.home_team_id]);
  const awayRoster = useMemo(() => rosters.filter((item) => item.team_id === match?.away_team_id), [rosters, match?.away_team_id]);
  const homeSubmitted = homeRoster.length > 0;
  const awaySubmitted = !match?.away_team_id || awayRoster.length > 0;
  const isAssignedReferee = Boolean(user?.id && assignment?.referee_id === user.id && assignment.status === "accepted");
  const isFinalized = match?.status === "finalized" || match?.status === "auto_finalized";
  const summary = useMemo(() => buildSummary(votes, members.length), [members.length, votes]);
  const memberRows = useMemo(() => buildMemberRows(members, votes), [members, votes]);
  const myVote = useMemo(() => votes.find((item) => item.user_id === user?.id)?.response ?? "unknown", [user?.id, votes]);
  const myRating = useMemo(() => (ratingsQuery.data ?? []).find((item) => item.rated_by === user?.id) ?? null, [ratingsQuery.data, user?.id]);
  const homeName = matchQuery.data?.homeTeam?.name ?? copy.thisTeam;
  const awayName = matchQuery.data?.awayTeam?.name ?? match?.opponent_name?.trim() ?? copy.opponentTbd;
  const statusTone = match ? getMatchStatusTone(match.status) : null;
  const searchDate = match?.scheduled_at ? match.scheduled_at.slice(0, 10) : null;
  const searchTime = match?.scheduled_at ? match.scheduled_at.slice(11, 16) : null;
  const provinceCode = team?.province_code ?? null;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFeeOpen, setIsFeeOpen] = useState(false);
  const [selectedReferee, setSelectedReferee] = useState<RefereeAvailability | null>(null);
  const [feeAmount, setFeeAmount] = useState("200000");
  const [paymentNote, setPaymentNote] = useState("");
  const [scoreFairness, setScoreFairness] = useState(4);
  const [scoreAccuracy, setScoreAccuracy] = useState(4);
  const [scoreAttitude, setScoreAttitude] = useState(4);
  const [overallScore, setOverallScore] = useState(4);
  const [ratingComment, setRatingComment] = useState("");

  const availableRefereesQuery = useRefereeQuery.useAvailableReferees(searchDate, searchTime, provinceCode, isSearchOpen && Boolean(searchDate && searchTime && provinceCode));

  const handleVote = async (response: VoteChoice): Promise<void> => {
    if (!pollQuery.data?.id) return;
    try {
      await voteMutation.mutateAsync({ pollId: pollQuery.data.id, response });
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.saveVoteError);
    }
  };

  const handleRequestReferee = async (): Promise<void> => {
    if (!match || !selectedReferee || !searchDate || !searchTime || !provinceCode) return;
    const parsedFee = Number(feeAmount.replaceAll(",", "").trim());
    if (!Number.isFinite(parsedFee) || parsedFee < 0) {
      Alert.alert("KickGo", refereeCopy.feeRequired);
      return;
    }
    try {
      await requestAssignmentMutation.mutateAsync({
        matchId: match.id,
        request: { match_id: match.id, referee_id: selectedReferee.referee_id, fee_amount: parsedFee },
        availabilityDate: searchDate,
        availabilityStartTime: searchTime,
        provinceCode,
        refereeId: selectedReferee.referee_id,
      });
      setIsFeeOpen(false);
      setIsSearchOpen(false);
      setSelectedReferee(null);
      Alert.alert("KickGo", refereeCopy.matchRefereeRequestSuccess);
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : refereeCopy.requestFailed);
    }
  };

  const handleConfirmRoster = async (): Promise<void> => {
    if (!matchId) return;
    try {
      await confirmRosterMutation.mutateAsync({ matchId });
      Alert.alert("KickGo", refereeCopy.rosterConfirmSuccess);
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : refereeCopy.requestFailed);
    }
  };

  const handleRecordPayment = async (): Promise<void> => {
    if (!assignment) return;
    try {
      await recordPaymentMutation.mutateAsync({
        refereeId: assignment.referee_id,
        matchId: assignment.match_id,
        request: { assignment_id: assignment.id, fee_amount: assignment.fee_amount, note: paymentNote.trim() || null },
      });
      setPaymentNote("");
      Alert.alert("KickGo", refereeCopy.paymentSuccess);
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : refereeCopy.requestFailed);
    }
  };

  const handleSubmitRating = async (): Promise<void> => {
    if (!matchId || !assignment) {
      Alert.alert("KickGo", refereeCopy.ratingMissingAssignment);
      return;
    }
    try {
      await rateMutation.mutateAsync({
        match_id: matchId,
        assignment_id: assignment.id,
        score_fairness: scoreFairness,
        score_accuracy: scoreAccuracy,
        score_attitude: scoreAttitude,
        overall_score: overallScore,
        comment: ratingComment.trim() || null,
      });
      Alert.alert("KickGo", refereeCopy.ratingSuccess);
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : refereeCopy.requestFailed);
    }
  };

  const rosterWaitingMessage = !homeSubmitted && !awaySubmitted ? refereeCopy.rosterWaitingBoth : !homeSubmitted ? refereeCopy.rosterWaitingHome : !awaySubmitted ? refereeCopy.rosterWaitingAway : null;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TeamMatchInlineHeader title={copy.detailTitle} onBack={() => router.replace({ pathname: "/(tabs)/team/[teamId]/matches", params: { teamId: teamId ?? "" } })} />
        {!match ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>{copy.noMatchesInMonth}</Text></View>
        ) : (
          <>
            <View style={styles.infoCard}>
              <View style={styles.infoTopRow}>
                <Text style={styles.matchTitle}>{`${homeName} vs ${awayName}`}</Text>
                {statusTone ? <View style={[styles.badge, { backgroundColor: statusTone.backgroundColor }]}><Text style={[styles.badgeLabel, { color: statusTone.color }]}>{getMatchStatusLabel(copy, match.status)}</Text></View> : null}
              </View>
              <Text style={styles.metaText}>{formatMatchDateTime(match.scheduled_at, language)}</Text>
              <Text style={styles.metaText}>{match.venue_name?.trim() || copy.venueFallback}</Text>
              <View style={styles.typeBadge}><Text style={styles.typeLabel}>{getMatchTypeLabel(copy, match.match_type)}</Text></View>
            </View>

            {canManage ? (
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>{refereeCopy.rosterSectionTitle}</Text>
                  <Pressable onPress={() => router.push({ pathname: "/(tabs)/team/[teamId]/roster-submit", params: { teamId: teamId ?? "", matchId: match.id } })}><Text style={styles.sectionLink}>{currentTeamRoster.length > 0 ? refereeCopy.rosterUpdate : refereeCopy.rosterSubmit}</Text></Pressable>
                </View>
                {currentTeamRoster.length > 0 ? <RosterBlock title={team?.name ?? copy.thisTeam} rows={currentTeamRoster} emptyLabel={refereeCopy.rosterEmpty} /> : <Text style={styles.helperText}>{refereeCopy.rosterEmpty}</Text>}
              </View>
            ) : null}

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{refereeCopy.matchRefereeTitle}</Text>
              {assignment ? (
                <>
                  <View style={styles.refereeCard}>
                    <View style={styles.refereeIdentity}>
                      {assignment.referee_avatar_url ? <Image source={{ uri: assignment.referee_avatar_url }} style={styles.refereeAvatar} /> : <View style={styles.refereeAvatarFallback}><Text style={styles.refereeAvatarFallbackLabel}>{getInitial(assignment.referee_name)}</Text></View>}
                      <View style={styles.refereeCopy}><Text style={styles.refereeName}>{assignment.referee_name ?? "Referee"}</Text><Text style={styles.refereeMeta}>{formatCurrency(assignment.fee_amount, language)}</Text></View>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: getRefereeAssignmentTone(assignment.status).backgroundColor }]}><Text style={[styles.statusPillLabel, { color: getRefereeAssignmentTone(assignment.status).color }]}>{getRefereeAssignmentStatusLabel(refereeCopy, assignment.status)}</Text></View>
                  </View>
                  {canManage && assignment.status !== "completed" && ["finished", "finalized", "auto_finalized"].includes(match.status) ? (
                    <View style={styles.inlineCard}>
                      <Text style={styles.inlineTitle}>{refereeCopy.paymentSectionTitle}</Text>
                      <TextInput value={paymentNote} onChangeText={setPaymentNote} placeholder={refereeCopy.paymentNotePlaceholder} style={styles.input} />
                      <Pressable disabled={recordPaymentMutation.isPending} onPress={() => void handleRecordPayment()} style={[styles.primaryButton, recordPaymentMutation.isPending ? styles.disabled : null]}><Text style={styles.primaryButtonLabel}>{refereeCopy.paymentAction}</Text></Pressable>
                    </View>
                  ) : null}
                  {assignment.status === "completed" ? <View style={styles.doneBadge}><Text style={styles.doneBadgeLabel}>{refereeCopy.paymentCompletedBadge}</Text></View> : null}
                </>
              ) : (
                <>
                  <Text style={styles.helperText}>{refereeCopy.matchRefereeEmpty}</Text>
                  {canManage ? <Pressable onPress={() => setIsSearchOpen(true)} style={styles.primaryButton}><Text style={styles.primaryButtonLabel}>{refereeCopy.matchRefereeFind}</Text></Pressable> : null}
                </>
              )}
            </View>
            {isAssignedReferee ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{refereeCopy.refereeViewTitle}</Text>
                <RosterBlock title={refereeCopy.rosterHomeTeam} rows={homeRoster} emptyLabel={refereeCopy.rosterNotSubmitted} />
                {match.away_team_id ? <RosterBlock title={refereeCopy.rosterAwayTeam} rows={awayRoster} emptyLabel={refereeCopy.rosterNotSubmitted} /> : null}
                {rosterWaitingMessage ? <Text style={styles.helperText}>{rosterWaitingMessage}</Text> : null}
                {homeSubmitted && awaySubmitted && match.status === "scheduled" ? <Pressable disabled={confirmRosterMutation.isPending} onPress={() => void handleConfirmRoster()} style={[styles.primaryButton, confirmRosterMutation.isPending ? styles.disabled : null]}><Text style={styles.primaryButtonLabel}>{refereeCopy.rosterConfirmAction}</Text></Pressable> : null}
              </View>
            ) : null}

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{copy.attendanceTitle}</Text>
              <Text style={styles.helperText}>{`${copy.attendanceSummary} · ${getResponseLabel(copy, myVote)}`}</Text>
              {pollQuery.data ? <View style={styles.voteRow}><VoteButton label={copy.attendanceYes} isActive={myVote === "yes"} onPress={() => void handleVote("yes")} tone="yes" isDisabled={voteMutation.isPending} /><VoteButton label={copy.attendanceNo} isActive={myVote === "no"} onPress={() => void handleVote("no")} tone="no" isDisabled={voteMutation.isPending} /><VoteButton label={copy.attendanceMaybe} isActive={myVote === "maybe"} onPress={() => void handleVote("maybe")} tone="maybe" isDisabled={voteMutation.isPending} /></View> : <Text style={styles.helperText}>{copy.noAttendancePoll}</Text>}
              <View style={styles.summaryGrid}><View style={styles.summaryCell}><Text style={styles.summaryValue}>{summary.yesCount}</Text><Text style={styles.summaryLabel}>{copy.votesYes}</Text></View><View style={styles.summaryCell}><Text style={styles.summaryValue}>{summary.noCount}</Text><Text style={styles.summaryLabel}>{copy.votesNo}</Text></View><View style={styles.summaryCell}><Text style={styles.summaryValue}>{summary.maybeCount}</Text><Text style={styles.summaryLabel}>{copy.votesMaybe}</Text></View><View style={styles.summaryCell}><Text style={styles.summaryValue}>{summary.totalCount}</Text><Text style={styles.summaryLabel}>{copy.participantsTitle}</Text></View></View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{copy.participantsTitle}</Text>
              {memberRows.length > 0 ? memberRows.map((row) => {
                const tone = getResponseTone(row.response);
                const name = row.member.profile?.display_name?.trim() || copy.thisTeam;
                return <View key={row.member.id} style={styles.memberRow}><View style={styles.memberIdentity}><View style={styles.memberAvatar}><Text style={styles.memberAvatarLabel}>{getInitial(name)}</Text></View><View style={styles.memberCopy}><Text style={styles.memberName}>{name}</Text>{row.member.squad_number ? <Text style={styles.memberMeta}>{`#${row.member.squad_number}`}</Text> : null}</View></View><View style={[styles.memberStatus, { backgroundColor: tone.bg }]}><Text style={[styles.memberStatusLabel, { color: tone.text }]}>{getResponseLabel(copy, row.response)}</Text></View></View>;
              }) : <Text style={styles.helperText}>{copy.noMembers}</Text>}
            </View>

            {canManage ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>{refereeCopy.ratingSectionTitle}</Text>
                {!assignment ? <Text style={styles.helperText}>{refereeCopy.ratingMissingAssignment}</Text> : !isFinalized ? <Text style={styles.helperText}>{refereeCopy.matchRefereeCompleted}</Text> : myRating ? <View style={styles.inlineCard}><Text style={styles.inlineTitle}>{refereeCopy.ratingExistingTitle}</Text><Text style={styles.helperText}>{`${refereeCopy.ratingFairness}: ${myRating.score_fairness} · ${refereeCopy.ratingAccuracy}: ${myRating.score_accuracy} · ${refereeCopy.ratingAttitude}: ${myRating.score_attitude} · ${refereeCopy.ratingOverall}: ${myRating.overall_score}`}</Text>{myRating.comment ? <Text style={styles.helperText}>{myRating.comment}</Text> : null}</View> : <View style={styles.inlineCard}><RatingSelector label={refereeCopy.ratingFairness} value={scoreFairness} onChange={setScoreFairness} /><RatingSelector label={refereeCopy.ratingAccuracy} value={scoreAccuracy} onChange={setScoreAccuracy} /><RatingSelector label={refereeCopy.ratingAttitude} value={scoreAttitude} onChange={setScoreAttitude} /><RatingSelector label={refereeCopy.ratingOverall} value={overallScore} onChange={setOverallScore} /><TextInput value={ratingComment} onChangeText={setRatingComment} placeholder={refereeCopy.ratingCommentPlaceholder} style={styles.commentInput} multiline textAlignVertical="top" /><Pressable disabled={rateMutation.isPending} onPress={() => void handleSubmitRating()} style={[styles.primaryButton, rateMutation.isPending ? styles.disabled : null]}><Text style={styles.primaryButtonLabel}>{refereeCopy.ratingSubmit}</Text></Pressable></View>}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <Modal animationType="slide" onRequestClose={() => setIsSearchOpen(false)} transparent visible={isSearchOpen}>
        <Pressable onPress={() => setIsSearchOpen(false)} style={styles.modalOverlay}><Pressable onPress={(event) => event.stopPropagation()} style={styles.modalCard}><Text style={styles.modalTitle}>{refereeCopy.matchRefereeSearchTitle}</Text><Text style={styles.helperText}>{refereeCopy.matchRefereeSearchBody}</Text><View style={styles.metaBlock}><Text style={styles.metaBlockText}>{searchDate ?? "-"}</Text><Text style={styles.metaBlockText}>{searchTime ?? "-"}</Text><Text style={styles.metaBlockText}>{provinceCode ?? "-"}</Text></View><Pressable onPress={() => void availableRefereesQuery.refetch()} style={styles.searchButton}><Text style={styles.searchButtonLabel}>{refereeCopy.matchRefereeSearch}</Text></Pressable><ScrollView contentContainerStyle={styles.modalList} style={styles.modalScroll}>{(availableRefereesQuery.data ?? []).map((item) => <View key={item.id} style={styles.availableCard}><View style={styles.refereeIdentity}>{item.referee_avatar_url ? <Image source={{ uri: item.referee_avatar_url }} style={styles.refereeAvatar} /> : <View style={styles.refereeAvatarFallback}><Text style={styles.refereeAvatarFallbackLabel}>{getInitial(item.referee_name)}</Text></View>}<View style={styles.refereeCopy}><Text style={styles.refereeName}>{item.referee_name ?? "Referee"}</Text><Text style={styles.refereeMeta}>{`${item.start_time.slice(0, 5)} - ${item.end_time.slice(0, 5)}`}</Text>{typeof item.referee_rating === "number" ? <Text style={styles.refereeMeta}>{`★ ${item.referee_rating.toFixed(1)}`}</Text> : null}</View></View><Pressable onPress={() => { setSelectedReferee(item); setFeeAmount("200000"); setIsFeeOpen(true); }} style={styles.availableButton}><Text style={styles.availableButtonLabel}>{refereeCopy.matchRefereeRequest}</Text></Pressable></View>)}{!availableRefereesQuery.isLoading && (availableRefereesQuery.data ?? []).length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyText}>{refereeCopy.matchRefereeNoResults}</Text></View> : null}</ScrollView></Pressable></Pressable>
      </Modal>

      <Modal animationType="fade" onRequestClose={() => setIsFeeOpen(false)} transparent visible={isFeeOpen}>
        <Pressable onPress={() => setIsFeeOpen(false)} style={styles.modalOverlayCenter}><Pressable onPress={(event) => event.stopPropagation()} style={styles.feeCard}><Text style={styles.modalTitle}>{refereeCopy.matchRefereeFeeTitle}</Text><TextInput keyboardType="number-pad" value={feeAmount} onChangeText={setFeeAmount} placeholder={refereeCopy.matchRefereeFeePlaceholder} style={styles.input} /><Pressable disabled={requestAssignmentMutation.isPending} onPress={() => void handleRequestReferee()} style={[styles.primaryButton, requestAssignmentMutation.isPending ? styles.disabled : null]}><Text style={styles.primaryButtonLabel}>{refereeCopy.matchRefereeRequestSubmit}</Text></Pressable></Pressable></Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" }, content: { padding: 20, gap: 16, paddingBottom: 40 }, disabled: { opacity: 0.55 },
  infoCard: { borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", padding: 18, gap: 8 }, infoTopRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 }, matchTitle: { flex: 1, fontSize: 20, fontWeight: "800", color: "#0f172a" }, metaText: { fontSize: 14, color: "#64748b" }, badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }, badgeLabel: { fontSize: 11, fontWeight: "800" }, typeBadge: { alignSelf: "flex-start", borderRadius: 999, backgroundColor: "#f1f5f9", paddingHorizontal: 10, paddingVertical: 6 }, typeLabel: { fontSize: 11, fontWeight: "800", color: "#334155" },
  sectionCard: { borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", padding: 18, gap: 14 }, sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, sectionTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" }, sectionLink: { fontSize: 13, fontWeight: "800", color: "#2563eb" }, helperText: { fontSize: 14, color: "#64748b" },
  primaryButton: { minHeight: 48, borderRadius: 14, backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center", paddingHorizontal: 14 }, primaryButtonLabel: { fontSize: 14, fontWeight: "800", color: "#ffffff" },
  refereeCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 16, backgroundColor: "#f8fafc", padding: 14 }, refereeIdentity: { flex: 1, flexDirection: "row", gap: 12, alignItems: "center" }, refereeAvatar: { width: 46, height: 46, borderRadius: 23 }, refereeAvatarFallback: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center" }, refereeAvatarFallbackLabel: { fontSize: 16, fontWeight: "800", color: "#1d4ed8" }, refereeCopy: { flex: 1, gap: 4 }, refereeName: { fontSize: 15, fontWeight: "800", color: "#0f172a" }, refereeMeta: { fontSize: 13, color: "#64748b" }, statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }, statusPillLabel: { fontSize: 12, fontWeight: "800" }, doneBadge: { alignSelf: "flex-start", borderRadius: 999, backgroundColor: "#dcfce7", paddingHorizontal: 12, paddingVertical: 8 }, doneBadgeLabel: { fontSize: 12, fontWeight: "800", color: "#166534" }, inlineCard: { gap: 12, borderRadius: 16, backgroundColor: "#f8fafc", padding: 14 }, inlineTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" }, input: { minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: "#d1d5db", backgroundColor: "#ffffff", paddingHorizontal: 14, fontSize: 14, color: "#111827" },
  voteRow: { flexDirection: "row", gap: 10 }, voteButton: { flex: 1, minHeight: 48, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 }, voteButtonLabel: { fontSize: 14, fontWeight: "800" }, summaryGrid: { flexDirection: "row", flexWrap: "wrap", borderRadius: 18, backgroundColor: "#f8fafc", overflow: "hidden" }, summaryCell: { width: "50%", paddingVertical: 16, paddingHorizontal: 12, alignItems: "center", gap: 4 }, summaryValue: { fontSize: 22, fontWeight: "800", color: "#0f172a" }, summaryLabel: { fontSize: 12, fontWeight: "700", color: "#64748b", textAlign: "center" },
  memberRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 16, backgroundColor: "#f8fafc", paddingHorizontal: 14, paddingVertical: 12 }, memberIdentity: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }, memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center" }, memberAvatarLabel: { fontSize: 16, fontWeight: "800", color: "#1d4ed8" }, memberCopy: { flex: 1, gap: 2 }, memberName: { fontSize: 14, fontWeight: "700", color: "#0f172a" }, memberMeta: { fontSize: 12, color: "#64748b" }, memberStatus: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }, memberStatusLabel: { fontSize: 12, fontWeight: "800" },
  rosterGroup: { gap: 10 }, rosterTitle: { fontSize: 14, fontWeight: "800", color: "#334155" }, rosterRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, backgroundColor: "#f8fafc", paddingHorizontal: 12, paddingVertical: 10 }, rosterAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center" }, rosterAvatarLabel: { fontSize: 13, fontWeight: "800", color: "#1d4ed8" }, rosterCopy: { flex: 1, gap: 2 }, rosterName: { fontSize: 13, fontWeight: "700", color: "#0f172a" }, rosterMeta: { fontSize: 12, color: "#64748b" },
  ratingRow: { gap: 8 }, ratingLabel: { fontSize: 14, fontWeight: "700", color: "#334155" }, ratingOptions: { flexDirection: "row", gap: 8 }, ratingChip: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: "#cbd5e1", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" }, ratingChipActive: { borderColor: "#16a34a", backgroundColor: "#dcfce7" }, ratingChipLabel: { fontSize: 13, fontWeight: "800", color: "#475569" }, ratingChipLabelActive: { color: "#166534" }, commentInput: { minHeight: 110, borderRadius: 14, borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 14, paddingVertical: 14, fontSize: 14, color: "#111827" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.32)" }, modalOverlayCenter: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(15, 23, 42, 0.32)", padding: 20 }, modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: "#ffffff", padding: 20, gap: 12, maxHeight: "78%" }, modalTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" }, metaBlock: { borderRadius: 16, backgroundColor: "#f8fafc", padding: 14, gap: 4 }, metaBlockText: { fontSize: 13, fontWeight: "700", color: "#334155" }, searchButton: { minHeight: 46, borderRadius: 14, backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center" }, searchButtonLabel: { fontSize: 14, fontWeight: "800", color: "#0f172a" }, modalScroll: { maxHeight: 320 }, modalList: { gap: 12, paddingBottom: 16 }, availableCard: { borderRadius: 16, borderWidth: 1, borderColor: "#e5e7eb", padding: 14, gap: 12 }, availableButton: { minHeight: 42, borderRadius: 12, backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center" }, availableButtonLabel: { fontSize: 13, fontWeight: "800", color: "#ffffff" }, feeCard: { width: "100%", borderRadius: 22, backgroundColor: "#ffffff", padding: 20, gap: 14 },
  emptyCard: { borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f8fafc", padding: 20 }, emptyText: { fontSize: 14, color: "#475569" },
});
