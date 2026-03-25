import { Stack } from "expo-router";

import { getTeamHubCopy } from "@/constants/team-hub";
import { getTeamUiCopy } from "@/constants/team-ui";
import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";

export default function TeamLayout(): JSX.Element {
  const { language } = useI18n();
  const teamCopy = getTeamUiCopy(language);
  const hubCopy = getTeamHubCopy(language);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerTitleStyle: APP_HEADER_TITLE_STYLE,
      }}
    >
      <Stack.Screen name="create" options={{ title: teamCopy.createTitle }} />
      <Stack.Screen name="join" options={{ title: teamCopy.joinTitle }} />
      <Stack.Screen name="[teamId]" options={{ title: teamCopy.detailTitle }} />
      <Stack.Screen name="match-create" options={{ title: hubCopy.matchCreateTitle }} />
      <Stack.Screen name="match-detail" options={{ title: hubCopy.matchDetailTitle }} />
      <Stack.Screen name="match-vote" options={{ title: hubCopy.voteTitle }} />
      <Stack.Screen name="match-lineup" options={{ title: hubCopy.lineupTitle }} />
    </Stack>
  );
}