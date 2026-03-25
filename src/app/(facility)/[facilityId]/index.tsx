import { useLocalSearchParams, router } from "expo-router";

import { FeatureEmptyStateScreen } from "@/shared/components/FeatureEmptyStateScreen";

export default function FacilityDetailScreen(): JSX.Element {
  const params = useLocalSearchParams<{ facilityId?: string }>();

  return (
    <FeatureEmptyStateScreen
      eyebrow="Facility"
      title="운동장 상세"
      description="운동장 상세 화면은 다음 단계에서 연결됩니다."
      badge={params.facilityId ? `ID: ${params.facilityId}` : undefined}
      primaryAction={{ label: "운동장 관리로 이동", onPress: () => router.replace("/(tabs)/facility-management") }}
      secondaryAction={{ label: "뒤로 가기", onPress: () => router.back(), variant: "outline" }}
    />
  );
}
