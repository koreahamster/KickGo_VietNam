import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getTeamCreateCopy } from "@/constants/team-create";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { createTeamInvite } from "@/services/team.service";
import { useTeamCreateStore } from "@/store/team-create.store";

export default function TeamCreateCompleteScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getTeamCreateCopy(language);
  const {
    createdInviteCode,
    createdTeamId,
    createdTeamSlug,
    resetDraft,
    setCreatedInviteCode,
  } = useTeamCreateStore();
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!createdTeamId) {
      router.replace("/(team)/create");
    }
  }, [createdTeamId]);

  const featureRows = useMemo(
    () => copy.completeFeatures.map((label, index) => ({ label, opacity: 0.95 - index * 0.1 })),
    [copy.completeFeatures],
  );

  const handleShareInvite = async (): Promise<void> => {
    if (!createdTeamId) {
      return;
    }

    try {
      setIsSharing(true);
      let inviteCode = createdInviteCode;

      if (!inviteCode) {
        const invite = await createTeamInvite(createdTeamId);
        inviteCode = invite.invite_code;
        setCreatedInviteCode(inviteCode);
      }

      await Share.share({
        message: `${copy.completeShareMessage}\n\nInvite code: ${inviteCode}${createdTeamSlug ? `\nTeam: ${createdTeamSlug}` : ""}`,
      });
    } catch (error) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.inviteShareFailed);
    } finally {
      setIsSharing(false);
    }
  };

  const handleMaybeLater = (): void => {
    if (!createdTeamId) {
      router.replace("/(team)/create");
      return;
    }

    const nextTeamId = createdTeamId;
    resetDraft();
    router.replace({ pathname: "/(team)/[teamId]", params: { teamId: nextTeamId } });
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.celebrationWrap}>
          <View style={styles.celebrationCircle}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
          </View>
        </View>

        <Text style={styles.title}>{copy.completeTitle}</Text>
        <Text style={styles.subtitle}>{copy.completeSubtitle}</Text>

        <View style={styles.featureWrap}>
          {featureRows.map((item) => (
            <View key={item.label} style={[styles.featurePill, { opacity: item.opacity }]}>
              <Text style={styles.featurePillLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tipWrap}>
          <Text style={styles.tipLabel}>{copy.tipLabel}</Text>
          <Text style={styles.tipBody}>{copy.tipBody}</Text>
        </View>

        <View style={styles.footerButtons}>
          <Pressable
            disabled={isSharing}
            onPress={() => void handleShareInvite()}
            style={({ pressed }) => [styles.primaryButton, isSharing && styles.buttonDisabled, pressed ? styles.buttonPressed : null]}
          >
            <Text style={styles.primaryButtonLabel}>{copy.shareInviteNow}</Text>
          </Pressable>

          <Pressable
            onPress={handleMaybeLater}
            style={({ pressed }) => [styles.secondaryButton, pressed ? styles.buttonPressed : null]}
          >
            <Text style={styles.secondaryButtonLabel}>{copy.maybeLater}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",
  },
  celebrationWrap: {
    marginTop: 28,
    marginBottom: 24,
  },
  celebrationCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  celebrationEmoji: {
    fontSize: 72,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700",
    color: "#3b82f6",
    textAlign: "center",
  },
  featureWrap: {
    width: "100%",
    alignItems: "center",
    gap: 12,
    marginTop: 34,
  },
  featurePill: {
    borderRadius: 999,
    backgroundColor: "#eaf4ff",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  featurePillLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  tipWrap: {
    width: "100%",
    marginTop: 34,
    borderRadius: 24,
    backgroundColor: "#fafafa",
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: "center",
    gap: 14,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#9ca3af",
  },
  tipBody: {
    fontSize: 18,
    lineHeight: 30,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  footerButtons: {
    width: "100%",
    gap: 14,
    marginTop: "auto",
  },
  primaryButton: {
    minHeight: 58,
    borderRadius: 16,
    backgroundColor: "#1a1a2e",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#ffffff",
  },
  secondaryButton: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#111827",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.88,
  },
});