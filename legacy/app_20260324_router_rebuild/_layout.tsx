import { Stack } from "expo-router";
import { Text, TextInput, type StyleProp, type TextStyle } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SessionTimeoutGate } from "@/components/SessionTimeoutGate";
import { APP_HEADER_TITLE_STYLE, withAppFont } from "@/constants/typography";
import { LanguageProvider } from "@/core/i18n/LanguageProvider";

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
      <SafeAreaProvider>
        <SessionTimeoutGate />
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerTitleStyle: APP_HEADER_TITLE_STYLE,
            contentStyle: {
              backgroundColor: "#f3efe6",
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(settings)" options={{ headerShown: false }} />
          <Stack.Screen name="(team)" options={{ headerShown: false }} />
        </Stack>
      </SafeAreaProvider>
    </LanguageProvider>
  );
}