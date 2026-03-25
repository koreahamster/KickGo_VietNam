import type { SupportedLanguage } from "@/types/profile.types";

export type HomeCopy = {
  topTitle: string;
  quickActions: string;
  nextMatch: string;
  myTeams: string;
  manage: string;
  pendingActions: string;
  recentResults: string;
  seeMore: string;
  regionRank: string;
  fullView: string;
  popularShorts: string;
  createMatch: string;
  findMercenary: string;
  reserveField: string;
  regionStats: string;
  shop: string;
  attendanceVote: string;
  today: string;
  tomorrow: string;
  todayMatch: string;
  noTeamsTitle: string;
  noTeamsBody: string;
  createTeam: string;
  joinByCode: string;
  noUpcomingMatch: string;
  attendanceYes: string;
  attendanceNo: string;
  attendanceLate: string;
  attendancePending: string;
  pendingBadge: string;
  resultWaiting: string;
  mvpVoting: string;
  finalized: string;
  finalizedAuto: string;
  teamAdded: string;
  retrySection: string;
  loadingSection: string;
  noShorts: string;
  noTeamsYet: string;
  members: string;
  recruiting: string;
  closed: string;
  notifications: string;
  needProfileTitle: string;
  needProfileBody: string;
  continueOnboarding: string;
  quickRouteHint: string;
  noRecentResults: string;
  noRank: string;
  onboardingTitle: string;
  login: string;
};

const HOME_COPY: Record<SupportedLanguage, HomeCopy> = {
  ko: {
    topTitle: "홈",
    quickActions: "빠른 실행",
    nextMatch: "다음 경기",
    myTeams: "내 팀",
    manage: "관리",
    pendingActions: "지금 해야 할 일",
    recentResults: "최근 경기",
    seeMore: "더보기",
    regionRank: "지역 순위",
    fullView: "전체 보기",
    popularShorts: "인기 쇼츠",
    createMatch: "경기 만들기",
    findMercenary: "용병 찾기",
    reserveField: "운동장 예약",
    regionStats: "지역 통계",
    shop: "쇼핑몰",
    attendanceVote: "출석 투표하기",
    today: "오늘",
    tomorrow: "내일",
    todayMatch: "매치데이",
    noTeamsTitle: "팀에 참가하거나 만들어보세요",
    noTeamsBody: "아직 참여 중인 팀이 없어요. 팀을 만들거나 초대코드로 참가해서 KickGo를 시작해보세요.",
    createTeam: "팀 만들기",
    joinByCode: "초대코드로 참가",
    noUpcomingMatch: "다음 예정 경기가 없어요.",
    attendanceYes: "참석",
    attendanceNo: "불참",
    attendanceLate: "늦참",
    attendancePending: "미응답",
    pendingBadge: "건",
    resultWaiting: "결과 수락 대기 중",
    mvpVoting: "MVP 투표",
    finalized: "결과 확정",
    finalizedAuto: "자동 확정",
    teamAdded: "팀 추가",
    retrySection: "이 섹션을 불러오지 못했어요.",
    loadingSection: "불러오는 중...",
    noShorts: "아직 인기 쇼츠가 없어요.",
    noTeamsYet: "참여 중인 팀이 없어요",
    members: "명",
    recruiting: "모집중",
    closed: "마감",
    notifications: "알림",
    needProfileTitle: "프로필을 먼저 완료해주세요",
    needProfileBody: "공통 프로필과 역할 온보딩이 완료되어야 팀과 경기 데이터를 볼 수 있어요.",
    continueOnboarding: "온보딩 계속",
    quickRouteHint: "바로가기",
    noRecentResults: "최근 확정된 경기가 없어요.",
    noRank: "표시할 지역 순위가 없어요.",
    onboardingTitle: "KickGo를 시작해보세요",
    login: "로그인",
  },
  vi: {
    topTitle: "Trang chủ",
    quickActions: "Truy cập nhanh",
    nextMatch: "Trận tiếp theo",
    myTeams: "Đội của tôi",
    manage: "Quản lý",
    pendingActions: "Việc cần làm",
    recentResults: "Trận gần đây",
    seeMore: "Xem thêm",
    regionRank: "Xếp hạng khu vực",
    fullView: "Xem tất cả",
    popularShorts: "Shorts nổi bật",
    createMatch: "Tạo trận",
    findMercenary: "Tìm cầu thủ",
    reserveField: "Đặt sân",
    regionStats: "Thống kê khu vực",
    shop: "Cửa hàng",
    attendanceVote: "Bình chọn tham gia",
    today: "Hôm nay",
    tomorrow: "Ngày mai",
    todayMatch: "Ngày thi đấu",
    noTeamsTitle: "Hãy tham gia hoặc tạo đội",
    noTeamsBody: "Bạn chưa có đội nào. Hãy tạo đội mới hoặc tham gia bằng mã mời để bắt đầu cùng KickGo.",
    createTeam: "Tạo đội",
    joinByCode: "Tham gia bằng mã",
    noUpcomingMatch: "Chưa có trận sắp diễn ra.",
    attendanceYes: "Tham gia",
    attendanceNo: "Vắng mặt",
    attendanceLate: "Đến muộn",
    attendancePending: "Chưa phản hồi",
    pendingBadge: "việc",
    resultWaiting: "Đang chờ xác nhận kết quả",
    mvpVoting: "Bình chọn MVP",
    finalized: "Đã chốt",
    finalizedAuto: "Tự động chốt",
    teamAdded: "Thêm đội",
    retrySection: "Không thể tải mục này.",
    loadingSection: "Đang tải...",
    noShorts: "Chưa có shorts nổi bật.",
    noTeamsYet: "Bạn chưa có đội nào",
    members: "thành viên",
    recruiting: "Đang tuyển",
    closed: "Đã đóng",
    notifications: "Thông báo",
    needProfileTitle: "Hãy hoàn thành hồ sơ trước",
    needProfileBody: "Cần hoàn thành hồ sơ chung và onboarding vai trò để xem dữ liệu đội và trận đấu.",
    continueOnboarding: "Tiếp tục onboarding",
    quickRouteHint: "Lối tắt",
    noRecentResults: "Chưa có trận nào được chốt gần đây.",
    noRank: "Chưa có dữ liệu xếp hạng.",
    onboardingTitle: "Bắt đầu với KickGo",
    login: "Đăng nhập",
  },
  en: {
    topTitle: "Home",
    quickActions: "Quick actions",
    nextMatch: "Next match",
    myTeams: "My teams",
    manage: "Manage",
    pendingActions: "Action needed",
    recentResults: "Recent results",
    seeMore: "See more",
    regionRank: "Region rank",
    fullView: "View all",
    popularShorts: "Popular shorts",
    createMatch: "Create match",
    findMercenary: "Find mercenary",
    reserveField: "Book field",
    regionStats: "Region stats",
    shop: "Shop",
    attendanceVote: "Vote attendance",
    today: "Today",
    tomorrow: "Tomorrow",
    todayMatch: "Match day",
    noTeamsTitle: "Join or create your first team",
    noTeamsBody: "You do not have a team yet. Create one or join with an invite code to start with KickGo.",
    createTeam: "Create team",
    joinByCode: "Join by code",
    noUpcomingMatch: "There is no upcoming match.",
    attendanceYes: "Attending",
    attendanceNo: "Unavailable",
    attendanceLate: "Late",
    attendancePending: "No response",
    pendingBadge: "items",
    resultWaiting: "Result confirmation pending",
    mvpVoting: "MVP voting",
    finalized: "Finalized",
    finalizedAuto: "Auto finalized",
    teamAdded: "Add team",
    retrySection: "This section could not be loaded.",
    loadingSection: "Loading...",
    noShorts: "No popular shorts yet.",
    noTeamsYet: "No teams joined yet",
    members: "members",
    recruiting: "Recruiting",
    closed: "Closed",
    notifications: "Notifications",
    needProfileTitle: "Complete your profile first",
    needProfileBody: "A common profile and role onboarding are required before team and match data can be shown.",
    continueOnboarding: "Continue onboarding",
    quickRouteHint: "Quick links",
    noRecentResults: "There are no finalized matches yet.",
    noRank: "No region rank to show.",
    onboardingTitle: "Start with KickGo",
    login: "Login",
  },
};

export function getHomeCopy(language: SupportedLanguage): HomeCopy {
  return HOME_COPY[language] ?? HOME_COPY.en;
}