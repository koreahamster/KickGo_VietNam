import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getMercenaryCopy } from "@/features/mercenary/mercenary.copy";
import { formatMercenaryDateTime, getApplicationStatusTone } from "@/features/mercenary/mercenary.helpers";
import { useAuth } from "@/hooks/useAuth";
import { useMyApplications } from "@/hooks/useMercenaryQuery";

function getStatusLabel(copy: ReturnType<typeof getMercenaryCopy>, status: "pending" | "accepted" | "rejected"): string {
  if (status === "accepted") {
    return copy.statusAccepted;
  }
  if (status === "rejected") {
    return copy.statusRejected;
  }
  return copy.statusPending;
}

export function MyMercenaryApplicationsPreview(): JSX.Element | null {
  const { language } = useI18n();
  const copy = getMercenaryCopy(language);
  const { user } = useAuth();
  const query = useMyApplications(user?.id ?? null, Boolean(user?.id));

  if (!user?.id || query.isLoading) {
    return null;
  }

  const items = query.data?.slice(0, 3) ?? [];
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>{copy.myApplicationsTitle}</Text>
          <Text style={styles.body}>{copy.profilePreviewBody}</Text>
        </View>
        <Pressable onPress={() => router.push("/(tabs)/profile/applications")}>
          <Text style={styles.link}>{copy.myApplicationsAllView}</Text>
        </Pressable>
      </View>
      <View style={styles.listWrap}>
        {items.map((item) => {
          const tone = getApplicationStatusTone(item.status);
          return (
            <Pressable key={item.id} onPress={() => router.push("/(tabs)/profile/applications")} style={styles.row}>
              <View style={styles.rowCopy}>
                <Text numberOfLines={1} style={styles.teamName}>{item.team_name ?? "KickGo Team"}</Text>
                <Text numberOfLines={1} style={styles.meta}>{formatMercenaryDateTime(item.match_scheduled_at, language)}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: tone.backgroundColor }]}>
                <Text style={[styles.statusLabel, { color: tone.color }]}>{getStatusLabel(copy, item.status)}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#dbe2ea",
    padding: 20,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
  },
  link: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  listWrap: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  teamName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  meta: {
    fontSize: 12,
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
});