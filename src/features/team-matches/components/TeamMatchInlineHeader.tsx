import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { withAppFont } from "@/constants/typography";

type TeamMatchInlineHeaderProps = {
  title: string;
  onBack: () => void;
};

export function TeamMatchInlineHeader(props: TeamMatchInlineHeaderProps): JSX.Element {
  const { title, onBack } = props;

  return (
    <View style={styles.headerRow}>
      <Pressable hitSlop={10} onPress={onBack} style={styles.backButton}>
        <Ionicons color="#0f172a" name="chevron-back" size={20} />
      </Pressable>
      <Text style={withAppFont(styles.title)}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
});