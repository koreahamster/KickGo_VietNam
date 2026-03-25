import { Stack } from "expo-router";
import { Text, TextInput, type StyleProp, type TextStyle } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SessionTimeoutGate } from "@/components/SessionTimeoutGate";
import { APP_HEADER_TITLE_STYLE, withAppFont } from "@/constants/typography";
import { LanguageProvider } from "@/core/i18n/LanguageProvider";
import { AppQueryProvider } from "@/core/query/QueryProvider";

type ComponentWithDefaultStyle = {
  defaultProps?: {
    style?: StyleProp<TextStyle>;
  };
};

const GlobalText = Text as typeof Text & ComponentWithDefaultStyle;
const GlobalTextInput = TextInput as typeof TextInput & ComponentWithDefaultStyle;

GlobalText.defaultProps = {
  ...(GlobalText.defaultProps ?? {}),
  style: withAppFont(GlobalText.defaultProps?.style),
};

GlobalTextInput.defaultProps = {
  ...(GlobalTextInput.defaultProps ?? {}),
  style: withAppFont(GlobalTextInput.defaultProps?.style),
};

export default function RootLayout(): JSX.Element {
  return (
    <LanguageProvider>
      <AppQueryProvider>
        <SafeAreaProvider>
          <SessionTimeoutGate />
          <Stack
            screenOptions={{
              headerShadowVisible: false,
              headerTitleStyle: APP_HEADER_TITLE_STYLE,
              contentStyle: { backgroundColor: "#f3efe6" },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
            <Stack.Screen name="search-result" options={{ title: "Search Result" }} />
            <Stack.Screen name="report-modal" options={{ presentation: "modal", title: "Report" }} />
            <Stack.Screen name="mercenary-posts" options={{ title: "Mercenary Posts" }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(team)" options={{ headerShown: false }} />
            <Stack.Screen name="(match)" options={{ headerShown: false }} />
            <Stack.Screen name="(league)" options={{ headerShown: false }} />
            <Stack.Screen name="(tournament)" options={{ headerShown: false }} />
            <Stack.Screen name="(facility)" options={{ headerShown: false }} />
            <Stack.Screen name="(shop)" options={{ headerShown: false }} />
            <Stack.Screen name="(social)" options={{ headerShown: false }} />
            <Stack.Screen name="(referee)" options={{ headerShown: false }} />
            <Stack.Screen name="(settings)" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaProvider>
      </AppQueryProvider>
    </LanguageProvider>
  );
}