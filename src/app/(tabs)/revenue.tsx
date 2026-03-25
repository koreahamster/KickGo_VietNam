import { router } from "expo-router";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { FeatureEmptyStateScreen } from "@/shared/components/FeatureEmptyStateScreen";

const COPY = {
  ko: {
    title: "수익",
    description: "심판 또는 시설 관리자 수익 내역을 확인하는 탭입니다.",
    badge: "정산 화면 준비 중",
    sectionTitle: "예정된 항목",
    sectionBody: "출금 가능 금액, 최근 정산, 지급 상태를 이 탭에 표시할 예정입니다.",
    sectionFooter: "현재는 역할별 핵심 진입 화면을 먼저 복원하고 있습니다.",
    primary: "홈으로 이동",
    secondary: "프로필 열기",
  },
  vi: {
    title: "Thu nhập",
    description: "Tab này sẽ hiển thị thu nhập của trọng tài hoặc quản lý sân.",
    badge: "Màn hình doanh thu đang được chuẩn bị",
    sectionTitle: "Sắp có",
    sectionBody: "Số tiền có thể rút, lịch sử thanh toán và trạng thái chi trả sẽ hiện tại đây.",
    sectionFooter: "Hiện tại chúng tôi đang khôi phục các màn hình vào chính theo vai trò trước.",
    primary: "Về trang chủ",
    secondary: "Mở hồ sơ",
  },
  en: {
    title: "Revenue",
    description: "This tab will show earnings for referees or facility managers.",
    badge: "Payout screen in progress",
    sectionTitle: "Planned",
    sectionBody: "Withdrawable balance, recent payouts, and settlement status will appear here.",
    sectionFooter: "Role-based entry screens are being restored first.",
    primary: "Go home",
    secondary: "Open profile",
  },
} as const;

export default function RevenueTabScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = COPY[language];

  return (
    <FeatureEmptyStateScreen
      eyebrow="KickGo Revenue"
      title={copy.title}
      description={copy.description}
      badge={copy.badge}
      sections={[{ title: copy.sectionTitle, body: copy.sectionBody, footer: copy.sectionFooter }]}
      primaryAction={{ label: copy.primary, onPress: () => router.replace("/(tabs)/home") }}
      secondaryAction={{ label: copy.secondary, onPress: () => router.push("/(tabs)/profile"), variant: "outline" }}
    />
  );
}