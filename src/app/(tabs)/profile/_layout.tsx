import { Stack } from "expo-router";

import { useI18n } from "@/core/i18n/LanguageProvider";

const TITLES = {
  ko: {
    playStyle: "\uD50C\uB808\uC774 \uC2A4\uD0C0\uC77C",
  },
  vi: {
    playStyle: "Phong cach choi",
  },
  en: {
    playStyle: "Play Style",
  },
} as const;

export default function ProfileStackLayout(): JSX.Element {
  const { language } = useI18n();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="play-style"
        options={{
          title: TITLES[language].playStyle,
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}