import { Tabs } from "expo-router";

export default function TabsLayout(): JSX.Element {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: "#f3efe6" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "홈" }} />
      <Tabs.Screen name="profile" options={{ title: "프로필" }} />
    </Tabs>
  );
}
