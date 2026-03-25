import { router } from "expo-router";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { FeatureEmptyStateScreen } from "@/shared/components/FeatureEmptyStateScreen";

const COPY = {
  ko: {
    title: "탐색",
    description: "클럽, 용병 모집, 시설을 한 화면에서 탐색하는 탭입니다.",
    badge: "검색 허브 준비 중",
    sectionTitle: "다음 확장 항목",
    sectionBody: "클럽 검색, 용병 모집 검색, 시설 검색 결과를 이 탭에서 통합할 예정입니다.",
    sectionFooter: "지금은 홈과 팀 화면의 기본 흐름을 먼저 안정화하고 있습니다.",
    primary: "팀으로 이동",
    secondary: "홈으로 이동",
  },
  vi: {
    title: "Khám phá",
    description: "Đây sẽ là nơi tìm đội, bài tìm quân và sân bóng trên cùng một tab.",
    badge: "Đang chuẩn bị trung tâm tìm kiếm",
    sectionTitle: "Mở rộng tiếp theo",
    sectionBody: "Tìm đội, bài tìm quân và kết quả tìm sân sẽ được gom vào đây.",
    sectionFooter: "Hiện tại chúng tôi đang ưu tiên ổn định luồng trang chủ và đội.",
    primary: "Đi tới đội",
    secondary: "Về trang chủ",
  },
  en: {
    title: "Explore",
    description: "This tab will unify club discovery, mercenary posts, and facilities.",
    badge: "Search hub in progress",
    sectionTitle: "Next expansion",
    sectionBody: "Club search, mercenary search, and facility results will be consolidated here.",
    sectionFooter: "Home and team flows are being stabilized first.",
    primary: "Go to team",
    secondary: "Go home",
  },
} as const;

export default function SearchTabScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = COPY[language];

  return (
    <FeatureEmptyStateScreen
      eyebrow="KickGo Explore"
      title={copy.title}
      description={copy.description}
      badge={copy.badge}
      sections={[{ title: copy.sectionTitle, body: copy.sectionBody, footer: copy.sectionFooter }]}
      primaryAction={{ label: copy.primary, onPress: () => router.replace("/(tabs)/team") }}
      secondaryAction={{ label: copy.secondary, onPress: () => router.replace("/(tabs)/home"), variant: "outline" }}
    />
  );
}