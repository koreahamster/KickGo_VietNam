import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

function getInitial(value: string | undefined): string {
  return value?.trim().slice(0, 1).toUpperCase() || "K";
}

export default function ProfileApplicationsScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getMercenaryCopy(language);
  const { user } = useAuth();
  const query = useMyApplications(user?.id ?? null, Boolean(user?.id));

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {(query.data ?? []).map((item) => {
          const tone = getApplicationStatusTone(item.status);
          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.teamRow}>
                  {item.team_emblem_url ? <Image source={{ uri: item.team_emblem_url }} style={styles.emblem} /> : <View style={styles.emblemFallback}><Text style={styles.emblemFallbackLabel}>{getInitial(item.team_name)}</Text></View>}
                  <View style={styles.teamCopy}>
                    <Text style={styles.teamName}>{item.team_name ?? "KickGo Team"}</Text>
                    <Text style={styles.meta}>{formatMercenaryDateTime(item.match_scheduled_at, language)}</Text>
                  </View>
                </View>
                <View style={[styles.statusPill, { backgroundColor: tone.backgroundColor }]}>
                  <Text style={[styles.statusLabel, { color: tone.color }]}>{getStatusLabel(copy, item.status)}</Text>
                </View>
              </View>
              <Text style={styles.positions}>{(item.needed_positions ?? []).join(" · ") || "-"}</Text>
              {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
            </View>
          );
        })}
        {!query.isLoading && (query.data ?? []).length === 0 ? (
          <View style={styles.emptyCard}><Text style={styles.emptyText}>{copy.myApplicationsEmpty}</Text></View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  content: { padding: 20, gap: 14, paddingBottom: 28 },
  card: { borderRadius: 22, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#ffffff", padding: 18, gap: 10 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  teamRow: { flex: 1, flexDirection: "row", gap: 12 },
  emblem: { width: 46, height: 46, borderRadius: 16, backgroundColor: "#e5e7eb" },
  emblemFallback: { width: 46, height: 46, borderRadius: 16, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center" },
  emblemFallbackLabel: { fontSize: 16, fontWeight: "800", color: "#1d4ed8" },
  teamCopy: { flex: 1, gap: 4 },
  teamName: { fontSize: 16, fontWeight: "800", color: "#111827" },
  meta: { fontSize: 12, color: "#6b7280" },
  positions: { fontSize: 13, fontWeight: "700", color: "#374151" },
  message: { fontSize: 13, lineHeight: 20, color: "#4b5563" },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusLabel: { fontSize: 12, fontWeight: "800" },
  emptyCard: { borderRadius: 22, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f8fafc", padding: 22, alignItems: "center" },
  emptyText: { fontSize: 15, fontWeight: "700", color: "#6b7280" },
});