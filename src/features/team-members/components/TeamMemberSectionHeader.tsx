import { StyleSheet, Text, View } from "react-native";

type TeamMemberSectionHeaderProps = {
  title: string;
  count: number;
};

export default function TeamMemberSectionHeader(props: TeamMemberSectionHeaderProps): JSX.Element {
  const { title, count } = props;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.count}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },
  count: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6b7280",
  },
});
