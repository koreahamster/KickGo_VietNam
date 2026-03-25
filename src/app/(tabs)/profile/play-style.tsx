import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getPlayStyleLabels,
  getPlayStyleOptions,
  getPlayerProfileSectionCopy,
} from "@/constants/player-profile-sections";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerProfileDashboard } from "@/hooks/usePlayerProfileDashboard";
import type { PlayStyleValue } from "@/types/profile.types";

const PAGE_BG = "#eff1f7";
const CARD_BG = "#ffffff";
const TEXT_DARK = "#111827";
const TEXT_SOFT = "#6b7280";
const BLUE = "#2563eb";
const BLUE_SOFT = "#dbeafe";
const GRAY_PILL = "#eef2f7";
const BORDER = "#dbe3ef";

export default function PlayStyleScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = getPlayerProfileSectionCopy(language);
  const options = getPlayStyleOptions(language);
  const { isAuthenticated, user } = useAuth();
  const dashboard = usePlayerProfileDashboard({
    userId: user?.id ?? null,
    enabled: isAuthenticated,
  });
  const playerProfile = dashboard.profileBundle?.playerProfile ?? null;
  const [selected, setSelected] = useState<PlayStyleValue[]>(playerProfile?.play_styles ?? []);

  useEffect(() => {
    setSelected(playerProfile?.play_styles ?? []);
  }, [playerProfile?.play_styles]);

  const selectedLabels = useMemo(() => getPlayStyleLabels(language, selected), [language, selected]);
  const hasChanges = JSON.stringify([...selected].sort()) !== JSON.stringify([...(playerProfile?.play_styles ?? [])].sort());

  const toggleStyle = (value: PlayStyleValue): void => {
    setSelected((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }

      if (current.length >= 3) {
        Alert.alert("KickGo", copy.playStyleLimit);
        return current;
      }

      return [...current, value];
    });
  };

  const handleSave = async (): Promise<void> => {
    if (!playerProfile) {
      Alert.alert("KickGo", copy.playerProfileRequired);
      return;
    }

    try {
      await dashboard.updatePlayerProfile({ playStyles: selected });
      router.back();
    } catch (error: unknown) {
      Alert.alert("KickGo", error instanceof Error ? error.message : copy.playStyleLimit);
    }
  };

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>{copy.playStyleTitle}</Text>
          <Text style={styles.subtitle}>{copy.playStyleSubtitle}</Text>

          {selectedLabels.length > 0 ? (
            <View style={styles.selectedWrap}>
              {selectedLabels.map((label) => (
                <View key={label} style={styles.selectedPill}>
                  <Text style={styles.selectedPillLabel}>{label}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyPill}>
              <Text style={styles.emptyPillLabel}>{copy.playStyleEmpty}</Text>
            </View>
          )}
        </View>

        <View style={styles.optionWrap}>
          {options.map((option) => {
            const isSelected = selected.includes(option.value);

            return (
              <Pressable
                key={option.value}
                disabled={dashboard.isUpdatingPlayerProfile}
                onPress={() => toggleStyle(option.value)}
                style={[styles.optionPill, isSelected ? styles.optionPillSelected : styles.optionPillIdle]}
              >
                <Text style={[styles.optionLabel, isSelected ? styles.optionLabelSelected : styles.optionLabelIdle]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          disabled={!hasChanges || dashboard.isUpdatingPlayerProfile}
          onPress={() => void handleSave()}
          style={({ pressed }) => [
            styles.saveButton,
            (!hasChanges || dashboard.isUpdatingPlayerProfile) && styles.saveButtonDisabled,
            pressed && hasChanges && !dashboard.isUpdatingPlayerProfile ? styles.saveButtonPressed : null,
          ]}
        >
          <Text style={styles.saveButtonLabel}>
            {dashboard.isUpdatingPlayerProfile ? "Saving..." : copy.playStyleSave}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 18,
  },
  card: {
    borderRadius: 22,
    backgroundColor: CARD_BG,
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: TEXT_DARK,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_SOFT,
  },
  selectedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  selectedPill: {
    borderRadius: 999,
    backgroundColor: BLUE_SOFT,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  selectedPillLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: BLUE,
  },
  emptyPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: GRAY_PILL,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginTop: 4,
  },
  emptyPillLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_SOFT,
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionPill: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  optionPillSelected: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  optionPillIdle: {
    backgroundColor: "#ffffff",
    borderColor: BORDER,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  optionLabelSelected: {
    color: "#ffffff",
  },
  optionLabelIdle: {
    color: TEXT_DARK,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: PAGE_BG,
  },
  saveButton: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BLUE,
  },
  saveButtonPressed: {
    opacity: 0.88,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
  },
});
