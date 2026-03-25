import { router } from "expo-router";

import { FeatureEmptyStateScreen } from "@/shared/components/FeatureEmptyStateScreen";

export default function FacilityNoticeCreateScreen(): JSX.Element {
  return (
    <FeatureEmptyStateScreen
      eyebrow="Facility"
      title="공지 등록"
      description="시설 공지 작성 화면은 다음 단계에서 연결됩니다."
      badge="Facility manager"
      primaryAction={{ label: "설정으로 이동", onPress: () => router.replace("/(settings)/settings") }}
      secondaryAction={{ label: "뒤로 가기", onPress: () => router.back(), variant: "outline" }}
    />
  );
}
