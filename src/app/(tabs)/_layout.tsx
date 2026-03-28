import { Ionicons } from "@expo/vector-icons";
import { router, Tabs } from "expo-router";
import { Image, Pressable } from "react-native";

import { ALL_ROLE_TAB_ROUTES, getRoleTabs } from "@/constants/role-switcher";
import { APP_HEADER_TITLE_STYLE, APP_TAB_LABEL_STYLE } from "@/constants/typography";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { getHomeAssetSource } from "@/features/home/home-assets";
import { GlobalDrawer } from "@/shared/components/GlobalDrawer";
import { useDrawerStore } from "@/store/drawer.store";
import { useRoleSwitchStore } from "@/store/role-switch.store";

function MenuButton(): JSX.Element {
  const openDrawer = useDrawerStore((state) => state.openDrawer);

  return (
    <Pressable hitSlop={10} onPress={openDrawer} style={{ marginLeft: 16 }}>
      <Ionicons color="#10231f" name="menu-outline" size={24} />
    </Pressable>
  );
}

function HomeHeaderTitle(): JSX.Element {
  return <Image resizeMode="contain" source={getHomeAssetSource("logo")} style={{ width: 96, height: 26 }} />;
}

function NotificationsButton(): JSX.Element {
  return (
    <Pressable hitSlop={10} onPress={() => router.push("/notifications")} style={{ marginRight: 16 }}>
      <Ionicons color="#10231f" name="notifications-outline" size={22} />
    </Pressable>
  );
}

function SettingsButton(): JSX.Element {
  return (
    <Pressable hitSlop={10} onPress={() => router.push("/(settings)/settings")} style={{ marginRight: 16 }}>
      <Ionicons color="#10231f" name="settings-outline" size={22} />
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
        detachInactiveScreens={false}
        screenOptions={{
          headerShadowVisible: false,
          headerTitleStyle: APP_HEADER_TITLE_STYLE,
          tabBarLabelStyle: APP_TAB_LABEL_STYLE,
          sceneStyle: { backgroundColor: "#ffffff" },
          tabBarActiveTintColor: "#10231f",
          tabBarInactiveTintColor: "#8b8b8b",
          animation: "none",
          lazy: false,
        }}
      >
        {visibleTabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.label,
              headerShown: true,
              headerLeft: tab.name !== "profile" ? () => <MenuButton /> : undefined,
              headerRight:
                tab.name === "home"
                  ? () => <NotificationsButton />
                  : tab.name === "profile"
                    ? () => <SettingsButton />
                    : undefined,
              headerTitle: tab.name === "home" ? () => <HomeHeaderTitle /> : undefined,
              tabBarIcon: ({ color, size }) => <Ionicons color={color} name={tab.icon} size={size} />,
            }}
          />
        ))}
        {ALL_ROLE_TAB_ROUTES.filter((routeName) => !visibleNames.has(routeName)).map((routeName) => (
          <Tabs.Screen key={routeName} name={routeName} options={{ href: null }} />
        ))}
      </Tabs>
      <GlobalDrawer />
    </>
  );
}
