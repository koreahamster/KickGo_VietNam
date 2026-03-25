import { Stack } from "expo-router";

export default function TeamCreateLayout(): JSX.Element {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#ffffff" } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="tactics" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}