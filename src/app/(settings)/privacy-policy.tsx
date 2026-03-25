import { router } from "expo-router";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { FeatureEmptyStateScreen } from "@/shared/components/FeatureEmptyStateScreen";

const COPY = {
  ko: {
    title: "개인정보처리방침",
    description: "KickGo 개인정보처리방침 전문은 이 화면에서 확인하게 됩니다.",
    badge: "정책 전문 연결 준비 중",
    sectionTitle: "현재 상태",
    sectionBody: "정적 정책 문서와 동의 버전 연결이 다음 단계에서 붙을 예정입니다.",
    sectionFooter: "지금은 설정 흐름이 placeholder 없이 이어지도록 정적 안내 화면을 먼저 제공합니다.",
    primary: "설정으로 돌아가기",
    secondary: "홈으로 이동",
  },
  vi: {
    title: "Chính sách riêng tư",
    description: "Toàn văn chính sách riêng tư của KickGo sẽ hiển thị tại đây.",
    badge: "Đang chuẩn bị nội dung chính sách",
    sectionTitle: "Hiện tại",
    sectionBody: "Liên kết tài liệu chính sách tĩnh và phiên bản đồng ý sẽ được thêm ở bước tiếp theo.",
    sectionFooter: "Trước mắt, màn hình này giúp luồng cài đặt không còn rơi vào placeholder.",
    primary: "Quay lại cài đặt",
    secondary: "Về trang chủ",
  },
  en: {
    title: "Privacy Policy",
    description: "The full KickGo privacy policy will be presented here.",
    badge: "Policy content in progress",
    sectionTitle: "Current state",
    sectionBody: "The static policy document and consent-version linkage will be added next.",
    sectionFooter: "For now this keeps the settings flow clear of placeholder cards.",
    primary: "Back to settings",
    secondary: "Go home",
  },
} as const;

export default function PrivacyPolicyScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = COPY[language];

  return (
    <FeatureEmptyStateScreen
      eyebrow="KickGo Policy"
      title={copy.title}
      description={copy.description}
      badge={copy.badge}
      sections={[{ title: copy.sectionTitle, body: copy.sectionBody, footer: copy.sectionFooter }]}
      primaryAction={{ label: copy.primary, onPress: () => router.replace("/(settings)/settings") }}
      secondaryAction={{ label: copy.secondary, onPress: () => router.replace("/(tabs)/home"), variant: "outline" }}
    />
  );
}