import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";

export default function ProductDetailLayout(): JSX.Element {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleStyle: APP_HEADER_TITLE_STYLE, contentStyle: { backgroundColor: "#f3efe6" } }}>
      <Stack.Screen name="index" options={{ title: "Product Detail" }} />
      <Stack.Screen name="order" options={{ title: "Order" }} />
    </Stack>
  );
}