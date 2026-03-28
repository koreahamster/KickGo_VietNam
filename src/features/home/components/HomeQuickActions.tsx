import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { HomeSectionHeader } from "@/features/home/components/HomeSectionHeader";
import type { HomeCopy } from "@/features/home/home-copy";
import { useDrawerStore } from "@/store/drawer.store";
import { useRoleStore } from "@/store/role-switch.store";
import type { SupportedLanguage } from "@/types/profile.types";

type QuickAction = {
  key: string;
  label: Record<SupportedLanguage, string>;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  background: string;
  route: string;
};

const QUICK_ACTIONS = {
  player: [
    { key: "create-match", label: { ko: "\uacbd\uae30 \ub9cc\ub4e4\uae30", vi: "Tao tran", en: "Create match" }, icon: "add-circle-outline", tint: "#0f766e", background: "#ecfdf5", route: "/(tabs)/team" },
    { key: "mercenary", label: { ko: "\uc6a9\ubcd1 \ucc3e\uae30", vi: "Tim cau thu", en: "Find mercenary" }, icon: "people-outline", tint: "#3b82f6", background: "#eff6ff", route: "/(tabs)/search" },
    { key: "facility", label: { ko: "\uc6b4\ub3d9\uc7a5 \uc608\uc57d", vi: "Dat san", en: "Book field" }, icon: "business-outline", tint: "#f97316", background: "#fff7ed", route: "/(facility)/facility-search" },
    { key: "rank", label: { ko: "\uc9c0\uc5ed \uc21c\uc704", vi: "Xep hang", en: "Region rank" }, icon: "trophy-outline", tint: "#16a34a", background: "#f0fdf4", route: "/(league)/region-stats" },
    { key: "shop", label: { ko: "\uc1fc\ud551\ubab0", vi: "Cua hang", en: "Shop" }, icon: "bag-handle-outline", tint: "#111827", background: "#f3f4f6", route: "/(shop)" },
  ],
  referee: [
    { key: "schedule", label: { ko: "\uc77c\uc815 \uad00\ub9ac", vi: "Lich dau", en: "Schedule" }, icon: "calendar-outline", tint: "#3b82f6", background: "#eff6ff", route: "/(tabs)/schedule" },
    { key: "availability", label: { ko: "\uac00\uc6a9\uc2dc\uac04", vi: "Thoi gian ranh", en: "Availability" }, icon: "time-outline", tint: "#8b5cf6", background: "#f5f3ff", route: "/(tabs)/profile/referee-availability" },
    { key: "revenue", label: { ko: "\uc218\uc775 \ud655\uc778", vi: "Thu nhap", en: "Revenue" }, icon: "wallet-outline", tint: "#16a34a", background: "#f0fdf4", route: "/(tabs)/revenue" },
    { key: "settings", label: { ko: "\uc124\uc815", vi: "Cai dat", en: "Settings" }, icon: "settings-outline", tint: "#111827", background: "#f3f4f6", route: "/(settings)/settings" },
  ],
  facility_manager: [
    { key: "bookings", label: { ko: "\uc608\uc57d \ud604\ud669", vi: "Dat cho", en: "Bookings" }, icon: "calendar-clear-outline", tint: "#3b82f6", background: "#eff6ff", route: "/(tabs)/booking-management" },
    { key: "facility-management", label: { ko: "\uc6b4\ub3d9\uc7a5 \uad00\ub9ac", vi: "Quan ly san", en: "Facility" }, icon: "business-outline", tint: "#0f766e", background: "#ecfdf5", route: "/(tabs)/facility-management" },
    { key: "revenue", label: { ko: "\uc218\uc775 \ud655\uc778", vi: "Doanh thu", en: "Revenue" }, icon: "wallet-outline", tint: "#16a34a", background: "#f0fdf4", route: "/(tabs)/revenue" },
    { key: "notice-create", label: { ko: "\uacf5\uc9c0 \ub4f1\ub85d", vi: "Dang thong bao", en: "Notice" }, icon: "megaphone-outline", tint: "#f97316", background: "#fff7ed", route: "/(facility)/notice-create" },
    { key: "settings", label: { ko: "\uc124\uc815", vi: "Cai dat", en: "Settings" }, icon: "settings-outline", tint: "#111827", background: "#f3f4f6", route: "/(settings)/settings" },
  ],
} satisfies Record<"player" | "referee" | "facility_manager", QuickAction[]>;

type HomeQuickActionsProps = {
  copy: HomeCopy;
};

export function HomeQuickActions(props: HomeQuickActionsProps): JSX.Element {
  const { copy } = props;
  const { language } = useI18n();
  const activeRole = useRoleStore((state) => state.activeRole);
  const openDrawer = useDrawerStore((state) => state.openDrawer);
  const actions = activeRole ? QUICK_ACTIONS[activeRole] : [];

  if (actions.length === 0) {
    return <></>;
  }

  return (
    <View style={styles.section}>
      <HomeSectionHeader actionLabel={copy.quickRouteHint} onPress={() => router.push("/(tabs)/search")} title={copy.quickActions} />
      <View style={styles.row}>
        {actions.map((action) => (
          <Pressable key={action.key} onPress={() => {
            if (action.key === "settings") {
              openDrawer();
              return;
            }
            router.push(action.route);
          }} style={({ pressed }) => [styles.item, pressed ? styles.itemPressed : null]}>
            <View style={[styles.iconWrap, { backgroundColor: action.background }]}>
              <Ionicons color={action.tint} name={action.icon} size={24} />
            </View>
            <Text numberOfLines={2} style={styles.label}>{action.label[language]}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingHorizontal: 20, marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  item: { flex: 1, alignItems: "center", gap: 10 },
  itemPressed: { transform: [{ scale: 0.95 }] },
  iconWrap: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center" },
  label: { minHeight: 34, textAlign: "center", fontSize: 12, lineHeight: 16, fontWeight: "600", color: "#374151" },
});
