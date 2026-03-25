import { Stack } from "expo-router";

import { APP_HEADER_TITLE_STYLE } from "@/constants/typography";

export default function RefereeLayout(): JSX.Element {
  return (
    <Stack screenOptions={{ headerShadowVisible: false, headerTitleStyle: APP_HEADER_TITLE_STYLE, contentStyle: { backgroundColor: "#f3efe6" } }}>
      <Stack.Screen name="referee-home" options={{ title: "Referee Home" }} />
      <Stack.Screen name="availability" options={{ title: "Availability" }} />
      <Stack.Screen name="assignments" options={{ title: "Assignments" }} />
      <Stack.Screen name="payment-history" options={{ title: "Payment History" }} />
      <Stack.Screen name="match/[matchId]" options={{ title: "Match Control" }} />
    </Stack>
  );
}