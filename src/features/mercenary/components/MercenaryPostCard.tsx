import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { getMercenaryCopy } from "@/features/mercenary/mercenary.copy";
import { formatMercenaryDateTime as formatDate, formatRelativeTime, getMercenaryRegionLabel, getPostStatusTone } from "@/features/mercenary/mercenary.helpers";
import { MercenaryPositionChips } from "@/features/mercenary/components/MercenaryPositionChips";
import type { MercenaryPost } from "@/types/mercenary.types";
import type { SupportedLanguage } from "@/types/profile.types";

function getInitial(value: string | undefined): string {
  return value?.trim().slice(0, 1).toUpperCase() || "K";
}

function getStatusLabel(language: SupportedLanguage, status: MercenaryPost["status"]): string {
  const copy = getMercenaryCopy(language);
  if (status === "closed") {
    return copy.statusClosed;
  }
  if (status === "cancelled") {
    return copy.statusCancelled;
  }
  return copy.statusOpen;
}

export function MercenaryPostCard(props: {
  post: MercenaryPost;
  language: SupportedLanguage;
  actionLabel?: string;
  actionDisabled?: boolean;
  hideAction?: boolean;
  onPress: () => void;
  onActionPress?: () => void;
}): JSX.Element {
  const { post, language, actionLabel, actionDisabled = false, hideAction = false, onPress, onActionPress } = props;
  const copy = getMercenaryCopy(language);
  const tone = getPostStatusTone(post.status);
  const regionLabel = getMercenaryRegionLabel(post.province_code, post.team_district_code);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}>
      <View style={styles.headerRow}>
        <View style={styles.teamRow}>
          {post.team_emblem_url ? (
            <Image source={{ uri: post.team_emblem_url }} style={styles.emblem} />
          ) : (
            <View style={styles.emblemFallback}>
              <Text style={styles.emblemFallbackLabel}>{getInitial(post.team_name)}</Text>
            </View>
          )}
          <View style={styles.teamCopy}>
            <Text numberOfLines={1} style={styles.teamName}>{post.team_name ?? "KickGo Team"}</Text>
            <Text numberOfLines={1} style={styles.metaText}>{regionLabel}</Text>
          </View>
        </View>
        <View style={[styles.statusPill, { backgroundColor: tone.backgroundColor }]}> 
          <Text style={[styles.statusLabel, { color: tone.color }]}>{getStatusLabel(language, post.status)}</Text>
        </View>
      </View>

      <MercenaryPositionChips language={language} positions={post.needed_positions} />

      <View style={styles.infoRow}>
        <View style={styles.infoPill}>
          <Ionicons color="#6b7280" name="people-outline" size={14} />
          <Text style={styles.infoText}>{`${post.needed_count}${copy.countSuffix}`}</Text>
        </View>
        {typeof post.accepted_count === "number" ? (
          <View style={styles.infoPill}>
            <Ionicons color="#059669" name="checkmark-circle-outline" size={14} />
            <Text style={styles.infoText}>{`${copy.acceptedCountLabel}: ${post.accepted_count}`}</Text>
          </View>
        ) : null}
      </View>

      {post.match_scheduled_at ? (
        <View style={styles.detailRow}>
          <Ionicons color="#6b7280" name="calendar-outline" size={16} />
          <Text style={styles.detailText}>{formatDate(post.match_scheduled_at, language)}</Text>
        </View>
      ) : null}

      <View style={styles.footerRow}>
        <Text style={styles.timeLabel}>{formatRelativeTime(post.created_at, language)}</Text>
        {!hideAction ? (
          <Pressable
            disabled={actionDisabled || !onActionPress}
            onPress={onActionPress}
            style={[styles.actionButton, actionDisabled ? styles.actionButtonDisabled : null]}
          >
            <Text style={[styles.actionButtonLabel, actionDisabled ? styles.actionButtonLabelDisabled : null]}>{actionLabel ?? copy.apply}</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 14,
  },
  cardPressed: {
    opacity: 0.92,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  teamRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  emblem: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
  },
  emblemFallback: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  emblemFallbackLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#166534",
  },
  teamCopy: {
    flex: 1,
    gap: 4,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  metaText: {
    fontSize: 13,
    color: "#6b7280",
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "800",
  },
  infoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  infoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: "#4b5563",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  timeLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  actionButton: {
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonDisabled: {
    backgroundColor: "#e5e7eb",
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  actionButtonLabelDisabled: {
    color: "#6b7280",
  },
});