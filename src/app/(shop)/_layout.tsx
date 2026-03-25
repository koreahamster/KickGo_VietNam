import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";

export default function ShopLayout(): JSX.Element {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleStyle: APP_HEADER_TITLE_STYLE, contentStyle: { backgroundColor: "#f3efe6" } }}>
      <Stack.Screen name="index" options={{ title: "Shop Home" }} />
      <Stack.Screen name="[productId]" options={{ headerShown: false }} />
      <Stack.Screen name="cart" options={{ title: "Cart" }} />
    </Stack>
  );
}