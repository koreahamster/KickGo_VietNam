import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable } from "react-native";

import { ALL_ROLE_TAB_ROUTES, getRoleTabs } from "@/constants/role-switcher";
import { APP_HEADER_TITLE_STYLE, APP_TAB_LABEL_STYLE } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { RoleSwitcherDrawer } from "@/shared/components/RoleSwitcherDrawer";
import { useRoleSwitchStore } from "@/store/role-switch.store";

function MenuButton(): JSX.Element {
  const openDrawer = useRoleSwitchStore((state) => state.openDrawer);

  return (
    <Pressable hitSlop={10} onPress={openDrawer} style={{ marginLeft: 16 }}>
      <Ionicons color="#10231f" name="menu-outline" size={24} />
    </Pressable>
  );
}

export default function TabsLayout(): JSX.Element {
  const { language } = useI18n();
  const activeRole = useRoleSwitchStore((state) => state.activeRole);
  const visibleTabs = getRoleTabs(language, activeRole);
  const visibleNames = new Set(visibleTabs.map((tab) => tab.name));

  return (
    <>
      <Tabs
        initialRouteName="home"
        key={activeRole}
        screenOptions={{
          headerShadowVisible: false,
          headerTitleStyle: APP_HEADER_TITLE_STYLE,
          tabBarLabelStyle: APP_TAB_LABEL_STYLE,
          sceneStyle: { backgroundColor: "#ffffff" },
          tabBarActiveTintColor: "#10231f",
          tabBarInactiveTintColor: "#8b8b8b",
        }}
      >
        {visibleTabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.label,
              headerShown: tab.name !== "home",
              headerLeft: tab.name !== "home" ? () => <MenuButton /> : undefined,
              tabBarIcon: ({ color, size }) => <Ionicons color={color} name={tab.icon} size={size} />,
            }}
          />
        ))}
        {ALL_ROLE_TAB_ROUTES.filter((routeName) => !visibleNames.has(routeName)).map((routeName) => (
          <Tabs.Screen key={routeName} name={routeName} options={{ href: null }} />
        ))}
      </Tabs>
      <RoleSwitcherDrawer />
    </>
  );
}