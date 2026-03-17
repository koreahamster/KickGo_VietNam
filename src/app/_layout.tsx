import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout(): JSX.Element {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#f3efe6",
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(settings)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
