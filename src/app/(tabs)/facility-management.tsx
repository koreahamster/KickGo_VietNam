import { router } from "expo-router";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { FeatureEmptyStateScreen } from "@/shared/components/FeatureEmptyStateScreen";

const COPY = {
  ko: {
    title: "운동장관리",
    description: "시설 정보, 운영 시간, 가격 정책을 관리하는 탭입니다.",
    badge: "시설 운영 화면 준비 중",
    sectionTitle: "예정된 항목",
    sectionBody: "시설 기본 정보, 대표 이미지, 시간표, 이용 정책이 이 화면으로 연결됩니다.",
    sectionFooter: "현재는 역할 전환 이후 탭 구조를 먼저 복원하고 있습니다.",
    primary: "홈으로 이동",
    secondary: "프로필 열기",
  },
  vi: {
    title: "Quản lý sân",
    description: "Tab này sẽ quản lý thông tin sân, giờ hoạt động và chính sách giá.",
    badge: "Màn hình vận hành sân đang được chuẩn bị",
    sectionTitle: "Sắp có",
    sectionBody: "Thông tin cơ bản, ảnh đại diện, lịch hoạt động và chính sách sử dụng sẽ nối về đây.",
    sectionFooter: "Hiện tại cấu trúc tab sau khi chuyển vai trò đang được khôi phục trước.",
    primary: "Về trang chủ",
    secondary: "Mở hồ sơ",
  },
  en: {
    title: "Facilities",
    description: "This tab will manage facility details, operating hours, and pricing.",
    badge: "Facility operations in progress",
    sectionTitle: "Planned",
    sectionBody: "Core facility info, hero images, operating schedules, and usage policies will connect here.",
    sectionFooter: "The role-switched tab structure is being restored first.",
    primary: "Go home",
    secondary: "Open profile",
  },
} as const;

export default function FacilityManagementTabScreen(): JSX.Element {
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