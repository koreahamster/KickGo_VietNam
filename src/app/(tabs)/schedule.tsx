import { router } from "expo-router";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { FeatureEmptyStateScreen } from "@/shared/components/FeatureEmptyStateScreen";

const COPY = {
  ko: {
    title: "일정",
    description: "심판에게 배정된 경기 일정을 이 탭에서 확인하게 됩니다.",
    badge: "심판 일정 준비 중",
    sectionTitle: "예정된 기능",
    sectionBody: "배정 경기, 장소, 시작 시각, 상태를 일정 리스트로 보여줄 예정입니다.",
    sectionFooter: "현재는 공용 홈과 프로필 흐름을 우선 제공합니다.",
    primary: "홈으로 이동",
    secondary: "프로필 열기",
  },
  vi: {
    title: "Lịch",
    description: "Lịch trận được phân công cho trọng tài sẽ hiển thị ở đây.",
    badge: "Đang chuẩn bị lịch trọng tài",
    sectionTitle: "Sắp có",
    sectionBody: "Danh sách trận được phân công, địa điểm, giờ bắt đầu và trạng thái sẽ được hiển thị tại đây.",
    sectionFooter: "Hiện tại chúng tôi ưu tiên home và profile chung.",
    primary: "Về trang chủ",
    secondary: "Mở hồ sơ",
  },
  en: {
    title: "Schedule",
    description: "Assigned referee matches will appear in this tab.",
    badge: "Referee schedule in progress",
    sectionTitle: "Planned",
    sectionBody: "Assigned matches, venue, kickoff time, and status will be shown as a list here.",
    sectionFooter: "The shared home and profile flows are prioritized first.",
    primary: "Go home",
    secondary: "Open profile",
  },
} as const;

export default function ScheduleTabScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = COPY[language];

  return (
    <FeatureEmptyStateScreen
      eyebrow="KickGo Referee"
      title={copy.title}
      description={copy.description}
      badge={copy.badge}
      sections={[{ title: copy.sectionTitle, body: copy.sectionBody, footer: copy.sectionFooter }]}
      primaryAction={{ label: copy.primary, onPress: () => router.replace("/(tabs)/home") }}
      secondaryAction={{ label: copy.secondary, onPress: () => router.push("/(tabs)/profile"), variant: "outline" }}
    />
  );
}