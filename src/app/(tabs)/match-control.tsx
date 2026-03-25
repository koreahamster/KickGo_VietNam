import { router } from "expo-router";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { FeatureEmptyStateScreen } from "@/shared/components/FeatureEmptyStateScreen";

const COPY = {
  ko: {
    title: "경기진행",
    description: "심판이 경기 기록과 진행 제어를 담당하는 화면이 여기에 들어옵니다.",
    badge: "심판 운영 화면 준비 중",
    sectionTitle: "예정된 흐름",
    sectionBody: "스코어 기록, 사건 기록, 경기 종료 처리가 이 탭에서 연결됩니다.",
    sectionFooter: "현재는 팀과 채팅 흐름을 먼저 안정화하고 있습니다.",
    primary: "홈으로 이동",
    secondary: "프로필 열기",
  },
  vi: {
    title: "Điều hành trận",
    description: "Màn hình trọng tài ghi nhận và điều hành trận sẽ nằm ở đây.",
    badge: "Đang chuẩn bị điều hành trận",
    sectionTitle: "Luồng 예정",
    sectionBody: "Ghi điểm, ghi sự kiện và kết thúc trận sẽ nối vào tab này.",
    sectionFooter: "Hiện tại đội và chat được ưu tiên ổn định trước.",
    primary: "Về trang chủ",
    secondary: "Mở hồ sơ",
  },
  en: {
    title: "Match Control",
    description: "Referee match recording and control tools will live here.",
    badge: "Referee control in progress",
    sectionTitle: "Planned flow",
    sectionBody: "Score logging, event recording, and match closing will connect to this tab.",
    sectionFooter: "Team and chat flows are being stabilized first.",
    primary: "Go home",
    secondary: "Open profile",
  },
} as const;

export default function MatchControlTabScreen(): JSX.Element {
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