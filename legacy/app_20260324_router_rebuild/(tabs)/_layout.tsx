import { Tabs } from "expo-router";

import { getTeamUiCopy } from "@/constants/team-ui";
import { APP_HEADER_TITLE_STYLE, APP_TAB_LABEL_STYLE } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";

export default function TabsLayout(): JSX.Element {
  const { language, t } = useI18n();
  const teamCopy = getTeamUiCopy(language);

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: APP_HEADER_TITLE_STYLE,
        tabBarLabelStyle: APP_TAB_LABEL_STYLE,
        sceneStyle: { backgroundColor: "#f3efe6" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("common.home") }} />
      <Tabs.Screen name="teams" options={{ title: teamCopy.tabTitle }} />
      <Tabs.Screen name="profile" options={{ title: t("profileTab.title") }} />
    </Tabs>
  );
}