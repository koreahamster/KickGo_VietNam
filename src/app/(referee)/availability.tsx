import { router } from "expo-router";

import { FeatureEmptyStateScreen } from "@/shared/components/FeatureEmptyStateScreen";

export default function RefereeAvailabilityScreen(): JSX.Element {
  return (
    <FeatureEmptyStateScreen
      eyebrow="Referee"
      title="가용시간 등록"
      description="심판 가용시간 등록 화면은 다음 단계에서 연결됩니다."
      badge="Role-specific screen"
      primaryAction={{ label: "일정으로 이동", onPress: () => router.replace("/(tabs)/schedule") }}
      secondaryAction={{ label: "뒤로 가기", onPress: () => router.back(), variant: "outline" }}
    />
  );
}
