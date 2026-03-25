import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RoutePlaceholderProps = {
  title: string;
  route: string;
  note?: string;
};

function handleBack(): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/");
}

export function RoutePlaceholder({ title, route, note }: RoutePlaceholderProps): JSX.Element {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Pressable hitSlop={12} onPress={handleBack} style={styles.iconButton}>
          <Ionicons color="#111827" name="chevron-back" size={24} />
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>
        <View style={styles.iconSpacer} />
      </View>

      <View style={styles.contentWrap}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>COMING SOON</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.route}>{route}</Text>
          <Text style={styles.note}>
            {note ?? "이 화면은 현재 실제 기능으로 교체 중입니다. 잠시 후 더 완성된 화면으로 연결됩니다."}
          </Text>
          <View style={styles.actionRow}>
            <Pressable onPress={handleBack} style={styles.primaryButton}>
              <Text style={styles.primaryButtonLabel}>뒤로 가기</Text>
            </Pressable>
            <Pressable onPress={() => router.replace("/")} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonLabel}>홈으로 이동</Text>
            </Pressable>
          </View>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eceff5",
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSpacer: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  contentWrap: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e6eaf2",
    padding: 24,
    gap: 12,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 3,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    color: "#64748b",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },
  route: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1d9e75",
  },
  note: {
    fontSize: 15,
    lineHeight: 23,
    color: "#475569",
  },
  actionRow: {
    marginTop: 8,
    gap: 10,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a2e",
  },
  primaryButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dbe1ea",
    backgroundColor: "#ffffff",
  },
  secondaryButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
});