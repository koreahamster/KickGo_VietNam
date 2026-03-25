import { router } from "expo-router";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { FeatureEmptyStateScreen } from "@/shared/components/FeatureEmptyStateScreen";

const COPY = {
  ko: {
    title: "예약관리",
    description: "시설 관리자 예약 현황과 승인 흐름을 이 탭에 연결합니다.",
    badge: "예약 대시보드 준비 중",
    sectionTitle: "예정된 항목",
    sectionBody: "오늘 예약, 승인 대기, 취소 요청, 시간대별 현황을 여기서 다루게 됩니다.",
    sectionFooter: "현재는 시설 관리자 기본 라우트와 프로필 흐름을 먼저 안정화하고 있습니다.",
    primary: "홈으로 이동",
    secondary: "프로필 열기",
  },
  vi: {
    title: "Quản lý đặt sân",
    description: "Bảng theo dõi đặt sân và luồng phê duyệt của quản lý sân sẽ vào tab này.",
    badge: "Dashboard đặt sân đang được chuẩn bị",
    sectionTitle: "Sắp có",
    sectionBody: "Đặt sân hôm nay, chờ duyệt, yêu cầu hủy và trạng thái theo khung giờ sẽ được quản lý tại đây.",
    sectionFooter: "Hiện tại chúng tôi ưu tiên ổn định route cơ bản và hồ sơ của quản lý sân.",
    primary: "Về trang chủ",
    secondary: "Mở hồ sơ",
  },
  en: {
    title: "Bookings",
    description: "Facility reservation status and approval workflows will connect here.",
    badge: "Booking dashboard in progress",
    sectionTitle: "Planned",
    sectionBody: "Today's bookings, pending approvals, cancellation requests, and timeslot status will be managed here.",
    sectionFooter: "Facility-manager routes and profile flows are being stabilized first.",
    primary: "Go home",
    secondary: "Open profile",
  },
} as const;

export default function BookingManagementTabScreen(): JSX.Element {
  const { language } = useI18n();
  const copy = COPY[language];

  return (
    <FeatureEmptyStateScreen
      eyebrow="KickGo Facility"
      title={copy.title}
      description={copy.description}
      badge={copy.badge}
      sections={[{ title: copy.sectionTitle, body: copy.sectionBody, footer: copy.sectionFooter }]}
      primaryAction={{ label: copy.primary, onPress: () => router.replace("/(tabs)/home") }}
      secondaryAction={{ label: copy.secondary, onPress: () => router.push("/(tabs)/profile"), variant: "outline" }}
    />
  );
}