import { Stack } from "expo-router";

export default function AuthLayout(): JSX.Element {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#f3efe6" },
      }}
    >
      <Stack.Screen name="login" options={{ title: "로그인" }} />
      <Stack.Screen name="signup" options={{ title: "회원가입" }} />
      <Stack.Screen name="phone-verify" options={{ title: "전화번호 인증" }} />
    </Stack>
  );
}
