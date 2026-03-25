import { StyleSheet, Text, View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";
import type { HomeCopy } from "@/features/home/home-copy";

type HomeTeamOnboardingCardProps = {
  copy: HomeCopy;
  onCreateTeam: () => void;
  onJoinTeam: () => void;
};

export function HomeTeamOnboardingCard(props: HomeTeamOnboardingCardProps): JSX.Element {
  const { copy, onCreateTeam, onJoinTeam } = props;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{copy.noTeamsTitle}</Text>
      <Text style={styles.body}>{copy.noTeamsBody}</Text>
      <View style={styles.actions}>
        <PrimaryButton label={copy.createTeam} onPress={onCreateTeam} />
        <PrimaryButton label={copy.joinByCode} onPress={onJoinTeam} variant="secondary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  body: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: "#6b7280",
  },
  actions: {
    marginTop: 16,
    gap: 10,
  },
});