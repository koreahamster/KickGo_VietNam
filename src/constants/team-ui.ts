import type { SelectOption } from "@/constants/profile-options";
import type { SupportedLanguage, SupportedVisibility } from "@/types/profile.types";
import type { TeamMemberRole } from "@/types/team.types";

type TeamUiCopy = {
  tabTitle: string;
  listTitle: string;
  listSubtitle: string;
  loading: string;
  needProfileTitle: string;
  needProfileHelper: string;
  continueOnboarding: string;
  goHome: string;
  emptyTitle: string;
  emptySubtitle: string;
  createButton: string;
  joinButton: string;
  detailButton: string;
  creating: string;
  inviteButton: string;
  inviteCreating: string;
  inviteCodePrefix: string;
  inviteExpiresPrefix: string;
  rolePrefix: string;
  visibilityPrefix: string;
  joinedAtPrefix: string;
  squadNumberPrefix: string;
  memberCountPrefix: string;
  recruitingOpen: string;
  recruitingClosed: string;
  notSet: string;
  createTitle: string;
  createSubtitle: string;
  joinTitle: string;
  joinSubtitle: string;
  detailTitle: string;
  detailSubtitle: string;
  infoTitle: string;
  membersTitle: string;
  membersSubtitle: string;
  noMembers: string;
  hiddenMember: string;
  backToTeams: string;
  nameLabel: string;
  namePlaceholder: string;
  countryLabel: string;
  countryValue: string;
  provinceLabel: string;
  districtLabel: string;
  visibilityLabel: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  inviteCodeLabel: string;
  inviteCodePlaceholder: string;
  selectProvince: string;
  selectDistrict: string;
  selectVisibility: string;
  save: string;
  joinSubmit: string;
  joining: string;
  cancel: string;
  validationName: string;
  validationRegion: string;
  validationInviteCode: string;
};

const TEAM_COPY: Record<SupportedLanguage, TeamUiCopy> = {
  ko: {
    tabTitle: "\uD300",
    listTitle: "\uB0B4 \uD300",
    listSubtitle: "\uCC38\uC5EC \uC911\uC778 \uD300\uC744 \uD655\uC778\uD558\uACE0 \uC0C8 \uD300\uC744 \uB9CC\uB4E4\uAC70\uB098 \uCD08\uB300 \uCF54\uB4DC\uB85C \uAC00\uC785\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    loading: "\uD300 \uC815\uBCF4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911\uC785\uB2C8\uB2E4.",
    needProfileTitle: "\uD300 \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD558\uB824\uBA74 \uACF5\uD1B5 \uD504\uB85C\uD544\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.",
    needProfileHelper: "\uD504\uB85C\uD544\uACFC \uC5ED\uD560 \uC628\uBCF4\uB529\uC744 \uBA3C\uC800 \uC644\uB8CC\uD55C \uB4A4 \uD300 \uAE30\uB2A5\uC744 \uC0AC\uC6A9\uD558\uC138\uC694.",
    continueOnboarding: "\uC628\uBCF4\uB529 \uACC4\uC18D",
    goHome: "\uD648\uC73C\uB85C \uC774\uB3D9",
    emptyTitle: "\uC544\uC9C1 \uCC38\uC5EC \uC911\uC778 \uD300\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.",
    emptySubtitle: "\uC0C8 \uD300\uC744 \uB9CC\uB4E4\uC5B4 owner\uB85C \uD300 \uC6B4\uC601\uC744 \uC2DC\uC791\uD558\uC138\uC694.",
    createButton: "\uD300 \uB9CC\uB4E4\uAE30",
    joinButton: "\uD300 \uAC00\uC785",
    detailButton: "\uC0C1\uC138 \uBCF4\uAE30",
    creating: "\uD300 \uC0DD\uC131 \uC911...",
    inviteButton: "\uCD08\uB300 \uCF54\uB4DC \uB9CC\uB4E4\uAE30",
    inviteCreating: "\uCF54\uB4DC \uC0DD\uC131 \uC911...",
    inviteCodePrefix: "\uCD08\uB300 \uCF54\uB4DC",
    inviteExpiresPrefix: "\uB9CC\uB8CC\uC77C",
    rolePrefix: "\uB0B4 \uC5ED\uD560",
    visibilityPrefix: "\uACF5\uAC1C \uBC94\uC704",
    joinedAtPrefix: "\uAC00\uC785\uC77C",
    squadNumberPrefix: "\uBC30\uBC88",
    memberCountPrefix: "\uBA64\uBC84 \uC218",
    recruitingOpen: "\uBAA8\uC9D1 \uC911",
    recruitingClosed: "\uBAA8\uC9D1 \uC885\uB8CC",
    notSet: "\uBBF8\uC124\uC815",
    createTitle: "\uD300 \uC0DD\uC131",
    createSubtitle: "\uD300 \uAE30\uBCF8 \uC815\uBCF4\uC640 \uACF5\uAC1C \uBC94\uC704\uB97C \uBA3C\uC800 \uC124\uC815\uD558\uC138\uC694.",
    joinTitle: "\uD300 \uAC00\uC785",
    joinSubtitle: "\uCD08\uB300 \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uD300\uC5D0 player \uC5ED\uD560\uB85C \uCC38\uC5EC\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
    detailTitle: "\uD300 \uC0C1\uC138",
    detailSubtitle: "\uD300 \uAE30\uBCF8 \uC815\uBCF4\uC640 \uD604\uC7AC \uBA64\uBC84 \uBAA9\uB85D\uC744 \uD655\uC778\uD569\uB2C8\uB2E4.",
    infoTitle: "\uD300 \uC815\uBCF4",
    membersTitle: "\uD300 \uBA64\uBC84",
    membersSubtitle: "\uD604\uC7AC \uD300\uC5D0 \uD65C\uC131 \uC0C1\uD0DC\uB85C \uCC38\uC5EC \uC911\uC778 \uBA64\uBC84 \uBAA9\uB85D\uC785\uB2C8\uB2E4.",
    noMembers: "\uC544\uC9C1 \uD45C\uC2DC\uD560 \uBA64\uBC84\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
    hiddenMember: "\uBE44\uACF5\uAC1C \uBA64\uBC84",
    backToTeams: "\uD300 \uBAA9\uB85D\uC73C\uB85C",
    nameLabel: "\uD300 \uC774\uB984",
    namePlaceholder: "\uC608: Hue United",
    countryLabel: "\uAD6D\uAC00",
    countryValue: "Vietnam",
    provinceLabel: "\uC2DC/\uC131",
    districtLabel: "\uAD6C/\uAD70",
    visibilityLabel: "\uACF5\uAC1C \uBC94\uC704",
    descriptionLabel: "\uD300 \uC18C\uAC1C (\uC120\uD0DD)",
    descriptionPlaceholder: "\uD300 \uBD84\uC704\uAE30\uB098 \uD65C\uB3D9 \uC9C0\uC5ED\uC744 \uC801\uC5B4 \uC8FC\uC138\uC694.",
    inviteCodeLabel: "\uCD08\uB300 \uCF54\uB4DC",
    inviteCodePlaceholder: "\uC608: A1B2C3D4",
    selectProvince: "\uC2DC/\uC131\uC744 \uC120\uD0DD\uD558\uC138\uC694",
    selectDistrict: "\uAD6C/\uAD70\uC744 \uC120\uD0DD\uD558\uC138\uC694",
    selectVisibility: "\uACF5\uAC1C \uBC94\uC704\uB97C \uC120\uD0DD\uD558\uC138\uC694",
    save: "\uD300 \uC0DD\uC131",
    joinSubmit: "\uAC00\uC785\uD558\uAE30",
    joining: "\uAC00\uC785 \uC911...",
    cancel: "\uCDE8\uC18C",
    validationName: "\uD300 \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
    validationRegion: "\uC2DC/\uC131\uACFC \uAD6C/\uAD70\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694.",
    validationInviteCode: "\uCD08\uB300 \uCF54\uB4DC\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694.",
  },
  vi: {
    tabTitle: "Đội",
    listTitle: "Đội của tôi",
    listSubtitle: "Xem các đội đang tham gia, tạo đội mới hoặc tham gia bằng mã mời.",
    loading: "Đang tải thông tin đội.",
    needProfileTitle: "Bạn cần hoàn tất hồ sơ chung trước khi dùng tính năng đội.",
    needProfileHelper: "Hãy hoàn tất onboarding hồ sơ và vai trò trước.",
    continueOnboarding: "Tiếp tục onboarding",
    goHome: "Về trang chủ",
    emptyTitle: "Bạn chưa tham gia đội nào.",
    emptySubtitle: "Hãy tạo đội mới và bắt đầu với vai trò owner.",
    createButton: "Tạo đội",
    joinButton: "Tham gia đội",
    detailButton: "Xem chi tiết",
    creating: "Đang tạo đội...",
    inviteButton: "Tạo mã mời",
    inviteCreating: "Đang tạo mã...",
    inviteCodePrefix: "Mã mời",
    inviteExpiresPrefix: "Hết hạn",
    rolePrefix: "Vai trò",
    visibilityPrefix: "Phạm vi hiển thị",
    joinedAtPrefix: "Ngày tham gia",
    squadNumberPrefix: "Số áo",
    memberCountPrefix: "Số thành viên",
    recruitingOpen: "Đang tuyển",
    recruitingClosed: "Ngừng tuyển",
    notSet: "Chưa thiết lập",
    createTitle: "Tạo đội",
    createSubtitle: "Thiết lập thông tin cơ bản và phạm vi hiển thị cho đội trước.",
    joinTitle: "Tham gia đội",
    joinSubtitle: "Nhập mã mời để tham gia đội với vai trò player.",
    detailTitle: "Chi tiết đội",
    detailSubtitle: "Xem thông tin cơ bản và danh sách thành viên hiện tại.",
    infoTitle: "Thông tin đội",
    membersTitle: "Thành viên đội",
    membersSubtitle: "Danh sách các thành viên đang hoạt động trong đội.",
    noMembers: "Chưa có thành viên nào để hiển thị.",
    hiddenMember: "Thành viên riêng tư",
    backToTeams: "Về danh sách đội",
    nameLabel: "Tên đội",
    namePlaceholder: "Ví dụ: Hue United",
    countryLabel: "Quốc gia",
    countryValue: "Vietnam",
    provinceLabel: "Tỉnh / Thành phố",
    districtLabel: "Quận / Huyện",
    visibilityLabel: "Phạm vi hiển thị",
    descriptionLabel: "Giới thiệu đội (tùy chọn)",
    descriptionPlaceholder: "Mô tả không khí đội hoặc khu vực hoạt động.",
    inviteCodeLabel: "Mã mời",
    inviteCodePlaceholder: "Ví dụ: A1B2C3D4",
    selectProvince: "Chọn tỉnh / thành phố",
    selectDistrict: "Chọn quận / huyện",
    selectVisibility: "Chọn phạm vi hiển thị",
    save: "Tạo đội",
    joinSubmit: "Tham gia",
    joining: "Đang tham gia...",
    cancel: "Hủy",
    validationName: "Vui lòng nhập tên đội.",
    validationRegion: "Vui lòng chọn tỉnh / thành phố và quận / huyện.",
    validationInviteCode: "Vui lòng nhập mã mời.",
  },
  en: {
    tabTitle: "Teams",
    listTitle: "My Teams",
    listSubtitle: "Review your active teams, create a new one, or join with an invite code.",
    loading: "Loading team information.",
    needProfileTitle: "A common profile is required before using team features.",
    needProfileHelper: "Finish profile and role onboarding before creating or joining a team.",
    continueOnboarding: "Continue onboarding",
    goHome: "Go home",
    emptyTitle: "You have not joined any team yet.",
    emptySubtitle: "Create a new team and start as the owner.",
    createButton: "Create team",
    joinButton: "Join team",
    detailButton: "View details",
    creating: "Creating team...",
    inviteButton: "Create invite code",
    inviteCreating: "Creating code...",
    inviteCodePrefix: "Invite code",
    inviteExpiresPrefix: "Expires",
    rolePrefix: "My role",
    visibilityPrefix: "Visibility",
    joinedAtPrefix: "Joined",
    squadNumberPrefix: "Squad number",
    memberCountPrefix: "Members",
    recruitingOpen: "Recruiting",
    recruitingClosed: "Not recruiting",
    notSet: "Not set",
    createTitle: "Create Team",
    createSubtitle: "Set the basic team information and visibility first.",
    joinTitle: "Join Team",
    joinSubtitle: "Enter an invite code to join a team as a player.",
    detailTitle: "Team Detail",
    detailSubtitle: "Review the team information and current roster.",
    infoTitle: "Team information",
    membersTitle: "Team members",
    membersSubtitle: "These are the members currently active in the team.",
    noMembers: "There are no members to show yet.",
    hiddenMember: "Private member",
    backToTeams: "Back to teams",
    nameLabel: "Team name",
    namePlaceholder: "Ex: Hue United",
    countryLabel: "Country",
    countryValue: "Vietnam",
    provinceLabel: "Province / City",
    districtLabel: "District",
    visibilityLabel: "Visibility",
    descriptionLabel: "Team description (optional)",
    descriptionPlaceholder: "Describe your team vibe or activity area.",
    inviteCodeLabel: "Invite code",
    inviteCodePlaceholder: "Ex: A1B2C3D4",
    selectProvince: "Select a province / city",
    selectDistrict: "Select a district",
    selectVisibility: "Select visibility",
    save: "Create team",
    joinSubmit: "Join team",
    joining: "Joining team...",
    cancel: "Cancel",
    validationName: "Please enter a team name.",
    validationRegion: "Please select a province and district.",
    validationInviteCode: "Please enter an invite code.",
  },
};

const TEAM_VISIBILITY_LABELS: Record<SupportedLanguage, Record<SupportedVisibility, string>> = {
  ko: {
    public: "\uC804\uCCB4 \uACF5\uAC1C",
    members_only: "\uBA64\uBC84\uB9CC",
    private: "\uBE44\uACF5\uAC1C",
  },
  vi: {
    public: "Công khai",
    members_only: "Chỉ thành viên",
    private: "Riêng tư",
  },
  en: {
    public: "Public",
    members_only: "Members only",
    private: "Private",
  },
};

const TEAM_ROLE_LABELS: Record<SupportedLanguage, Record<TeamMemberRole, string>> = {
  ko: {
    owner: "Owner",
    manager: "Manager",
    captain: "Captain",
    player: "Player",
  },
  vi: {
    owner: "Owner",
    manager: "Manager",
    captain: "Captain",
    player: "Player",
  },
  en: {
    owner: "Owner",
    manager: "Manager",
    captain: "Captain",
    player: "Player",
  },
};

export function getTeamUiCopy(language: SupportedLanguage): TeamUiCopy {
  return TEAM_COPY[language];
}

export function getTeamVisibilityOptions(language: SupportedLanguage): SelectOption[] {
  return [
    { label: TEAM_VISIBILITY_LABELS[language].public, value: "public" },
    { label: TEAM_VISIBILITY_LABELS[language].members_only, value: "members_only" },
    { label: TEAM_VISIBILITY_LABELS[language].private, value: "private" },
  ];
}

export function getTeamRoleLabel(language: SupportedLanguage, role: TeamMemberRole): string {
  return TEAM_ROLE_LABELS[language][role];
}