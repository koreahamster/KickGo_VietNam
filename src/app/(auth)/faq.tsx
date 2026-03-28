import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { withAppFont } from "@/constants/typography";

const FAQ_ITEMS = [
  {
    question: "KickGo\ub294 \uc5b4\ub5a4 \uc571\uc778\uac00\uc694?",
    answer:
      "\ubca0\ud2b8\ub0a8 \uc544\ub9c8\ucd94\uc5b4 \ucd95\uad6c \ucee4\ubba4\ub2c8\ud2f0 \ud50c\ub7ab\ud3fc\uc785\ub2c8\ub2e4. \ud300 \uad00\ub9ac, \uacbd\uae30 \uae30\ub85d, \uc2ec\ud310 \ubc30\uc815, \uc6b4\ub3d9\uc7a5 \uc608\uc57d\uc744 \ud55c \uacf3\uc5d0\uc11c \ucc98\ub9ac\ud569\ub2c8\ub2e4.",
  },
  {
    question: "\ubb34\ub8cc\ub85c \uc0ac\uc6a9\ud560 \uc218 \uc788\ub098\uc694?",
    answer:
      "\uc120\uc218 \uae30\ub2a5\uc740 \ubaa8\ub450 \ubb34\ub8cc\uc785\ub2c8\ub2e4. \uc6b4\ub3d9\uc7a5 \uc608\uc57d, \uac1c\ucd5c\uad8c \uad6c\ub9e4 \ub4f1 \uc77c\ubd80 \uc11c\ube44\uc2a4\ub294 \uc720\ub8cc\uc785\ub2c8\ub2e4.",
  },
  {
    question: "\uc5b4\ub5bb\uac8c \ud300\uc744 \ub9cc\ub4dc\ub098\uc694?",
    answer: "\ud68c\uc6d0\uac00\uc785 \ud6c4 \ud300 \ud0ed\uc5d0\uc11c \ud300 \ub9cc\ub4e4\uae30\ub97c \uc120\ud0dd\ud558\uc138\uc694.",
  },
  {
    question: "\uc2ec\ud310\uc73c\ub85c \ud65c\ub3d9\ud558\ub824\uba74 \uc5b4\ub5bb\uac8c \ud558\ub098\uc694?",
    answer: "\uc124\uc815\uc5d0\uc11c \uc5ed\ud560 \ucd94\uac00 \u2192 \uc2ec\ud310 \uc120\ud0dd \ud6c4 \ud504\ub85c\ud544\uc744 \ub4f1\ub85d\ud558\uc138\uc694.",
  },
  {
    question: "\ubb38\uc758\ub294 \uc5b4\ub514\uc11c \ud558\ub098\uc694?",
    answer: "kickgo.vn@gmail.com \uc73c\ub85c \uc5f0\ub77d\uc8fc\uc138\uc694.",
  },
];

export default function FaqScreen(): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="#0f172a" />
        </Pressable>
        <Text style={withAppFont(styles.headerTitle)}>\uc790\uc8fc \ubb3b\ub294 \uc9c8\ubb38</Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <View key={item.question} style={styles.itemCard}>
              <Pressable onPress={() => setOpenIndex(isOpen ? null : index)} style={styles.itemHeader}>
                <Text style={withAppFont(styles.questionText)}>Q. {item.question}</Text>
                <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color="#334155" />
              </Pressable>
              {isOpen ? <Text style={withAppFont(styles.answerText)}>A. {item.answer}</Text> : null}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  backButton: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  headerSpacer: { width: 32 },
  content: { paddingHorizontal: 20, paddingVertical: 20, gap: 12 },
  itemCard: { borderRadius: 16, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#ffffff", paddingHorizontal: 16, paddingVertical: 14 },
  itemHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  questionText: { flex: 1, fontSize: 15, fontWeight: "700", color: "#0f172a", lineHeight: 22 },
  answerText: { marginTop: 12, fontSize: 14, lineHeight: 22, color: "#475569" },
});
