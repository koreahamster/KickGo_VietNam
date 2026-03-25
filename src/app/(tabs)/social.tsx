import { router } from "expo-router";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { FeatureEmptyStateScreen } from "@/shared/components/FeatureEmptyStateScreen";

const COPY = {
  ko: {
    title: "소셜",
    description: "팀 채팅, 공지, 커뮤니티 활동을 이 탭에 모아둘 예정입니다.",
    badge: "채팅/피드 준비 중",
    sectionTitle: "지금 가능한 흐름",
    sectionBody: "현재는 팀 상세에서 팀 채팅으로 먼저 진입하도록 연결돼 있습니다.",
    sectionFooter: "피드, 댓글, 반응은 이 탭으로 합쳐질 예정입니다.",
    primary: "홈으로 이동",
    secondary: "프로필 열기",
  },
  vi: {
    title: "Xã hội",
    description: "Tab này sẽ tập trung chat đội, thông báo và hoạt động cộng đồng.",
    badge: "Chat và feed đang được mở rộng",
    sectionTitle: "Hiện tại",
    sectionBody: "Hiện tại luồng chat đội được nối từ màn hình chi tiết đội trước.",
    sectionFooter: "Feed, bình luận và reaction sẽ được gom về đây.",
    primary: "Về trang chủ",
    secondary: "Mở hồ sơ",
  },
  en: {
    title: "Social",
    description: "Team chat, notices, and community activity will live here.",
    badge: "Chat/feed expansion in progress",
    sectionTitle: "Current state",
    sectionBody: "Team chat is currently linked from the team detail flow first.",
    sectionFooter: "Feed, comments, and reactions will be consolidated here next.",
    primary: "Go home",
    secondary: "Open profile",
  },
} as const;

export default function SocialTabScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = COPY[language];

  return (
    <FeatureEmptyStateScreen
      eyebrow="KickGo Social"
      title={copy.title}
      description={copy.description}
      badge={copy.badge}
      sections={[{ title: copy.sectionTitle, body: copy.sectionBody, footer: copy.sectionFooter }]}
      primaryAction={{ label: copy.primary, onPress: () => router.replace("/(tabs)/home") }}
      secondaryAction={{ label: copy.secondary, onPress: () => router.push("/(tabs)/profile"), variant: "outline" }}
    />
  );
}