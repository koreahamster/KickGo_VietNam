import type { PlayStyleValue, SupportedLanguage } from "@/types/profile.types";

export const FOOT_SKILL_VALUES = [1, 2, 3, 4, 5] as const;
export const PLAY_STYLE_VALUES: PlayStyleValue[] = [
  "aggressive",
  "defensive",
  "dribbler",
  "build_up",
  "physical",
  "speed",
  "creative",
  "team_player",
  "scorer",
  "defender",
];

type PlayerProfileSectionCopy = {
  footSkillTitle: string;
  footSkillDescription: string;
  leftFoot: string;
  rightFoot: string;
  preferredFootLabel: string;
  footSkillModalTitle: string;
  footSkillSave: string;
  footSkillCancel: string;
  playStyleTitle: string;
  playStyleSubtitle: string;
  playStyleEmpty: string;
  playStyleSave: string;
  playStyleLimit: string;
  playerProfileRequired: string;
  preferredFeet: Record<"left" | "right" | "both", string>;
  playStyles: Record<PlayStyleValue, string>;
};

const COPY: Record<SupportedLanguage, PlayerProfileSectionCopy> = {
  ko: {
    footSkillTitle: "\uC591\uBC1C \uC219\uB828\uB3C4",
    footSkillDescription: "\uC67C\uBC1C\uACFC \uC624\uB978\uBC1C \uC219\uB828\uB3C4\uB97C \uAC01\uAC01 \uC124\uC815\uD560 \uC218 \uC788\uC5B4\uC694.",
    leftFoot: "\uC67C\uBC1C",
    rightFoot: "\uC624\uB978\uBC1C",
    preferredFootLabel: "\uC8FC\uBC1C",
    footSkillModalTitle: "\uC219\uB828\uB3C4 \uC218\uC900 \uC120\uD0DD",
    footSkillSave: "\uC800\uC7A5\uD558\uAE30",
    footSkillCancel: "\uCDE8\uC18C",
    playStyleTitle: "\uB098\uC758 \uD50C\uB808\uC774 \uC2A4\uD0C0\uC77C\uC740?",
    playStyleSubtitle: "\uCD5C\uB300 3\uAC1C\uC758 \uD50C\uB808\uC774 \uC2A4\uD0C0\uC77C\uC744 \uC120\uD0DD\uD560 \uC218 \uC788\uC5B4\uC694.",
    playStyleEmpty: "\uC120\uD0DD\uB41C \uD50C\uB808\uC774 \uC2A4\uD0C0\uC77C\uC774 \uC5C6\uC5B4\uC694",
    playStyleSave: "\uC800\uC7A5\uD558\uAE30",
    playStyleLimit: "\uD50C\uB808\uC774 \uC2A4\uD0C0\uC77C\uC740 \uCD5C\uB300 3\uAC1C\uAE4C\uC9C0 \uC120\uD0DD\uD560 \uC218 \uC788\uC5B4\uC694.",
    playerProfileRequired: "\uC120\uC218 \uD504\uB85C\uD544\uC744 \uBA3C\uC800 \uC644\uB8CC\uD574 \uC8FC\uC138\uC694.",
    preferredFeet: {
      left: "\uC67C\uBC1C",
      right: "\uC624\uB978\uBC1C",
      both: "\uC591\uBC1C",
    },
    playStyles: {
      aggressive: "\uACF5\uACA9\uC801",
      defensive: "\uC218\uBE44\uC801",
      dribbler: "\uB4DC\uB9AC\uBE14\uB7EC",
      build_up: "\uBE4C\uB4DC\uC5C5",
      physical: "\uD53C\uC9C0\uCEEC",
      speed: "\uC2A4\uD53C\uB4DC",
      creative: "\uCC3D\uC758\uC801",
      team_player: "\uD300\uD50C\uB808\uC774\uC5B4",
      scorer: "\uB4DD\uC810\uD615",
      defender: "\uC218\uBE44\uD615",
    },
  },
  vi: {
    footSkillTitle: "Ky nang hai chan",
    footSkillDescription: "Ban co the dat muc thanh thao cho chan trai va chan phai.",
    leftFoot: "Chan trai",
    rightFoot: "Chan phai",
    preferredFootLabel: "Chan thuan",
    footSkillModalTitle: "Chon muc thanh thao",
    footSkillSave: "Luu",
    footSkillCancel: "Huy",
    playStyleTitle: "Phong cach choi cua toi?",
    playStyleSubtitle: "Ban co the chon toi da 3 phong cach choi.",
    playStyleEmpty: "Chua co phong cach nao duoc chon",
    playStyleSave: "Luu",
    playStyleLimit: "Chi co the chon toi da 3 phong cach.",
    playerProfileRequired: "Hay hoan thanh ho so cau thu truoc.",
    preferredFeet: {
      left: "Chan trai",
      right: "Chan phai",
      both: "Hai chan",
    },
    playStyles: {
      aggressive: "Tan cong",
      defensive: "Phong ngu",
      dribbler: "Re bong",
      build_up: "Build-up",
      physical: "The luc",
      speed: "Toc do",
      creative: "Sang tao",
      team_player: "Vi dong doi",
      scorer: "San ban",
      defender: "Hau ve",
    },
  },
  en: {
    footSkillTitle: "Weak Foot Skill",
    footSkillDescription: "Set your left and right foot proficiency separately.",
    leftFoot: "Left Foot",
    rightFoot: "Right Foot",
    preferredFootLabel: "Preferred foot",
    footSkillModalTitle: "Choose a skill level",
    footSkillSave: "Save",
    footSkillCancel: "Cancel",
    playStyleTitle: "What is my play style?",
    playStyleSubtitle: "You can select up to 3 play styles.",
    playStyleEmpty: "No play style has been selected",
    playStyleSave: "Save",
    playStyleLimit: "You can select up to 3 play styles.",
    playerProfileRequired: "Complete your player profile first.",
    preferredFeet: {
      left: "Left",
      right: "Right",
      both: "Both",
    },
    playStyles: {
      aggressive: "Aggressive",
      defensive: "Defensive",
      dribbler: "Dribbler",
      build_up: "Build-up",
      physical: "Physical",
      speed: "Speed",
      creative: "Creative",
      team_player: "Team player",
      scorer: "Scorer",
      defender: "Defender",
    },
  },
};

export function getPlayerProfileSectionCopy(language: SupportedLanguage): PlayerProfileSectionCopy {
  return COPY[language];
}

export function getPlayStyleOptions(language: SupportedLanguage): Array<{ value: PlayStyleValue; label: string }> {
  const copy = COPY[language];
  return PLAY_STYLE_VALUES.map((value) => ({
    value,
    label: copy.playStyles[value],
  }));
}

export function getPlayStyleLabels(language: SupportedLanguage, values: PlayStyleValue[]): string[] {
  const copy = COPY[language];
  return values.map((value) => copy.playStyles[value]).filter(Boolean);
}

export function getPreferredFootLabel(language: SupportedLanguage, value: string | null | undefined): string {
  const copy = COPY[language];

  if (value === "left" || value === "right" || value === "both") {
    return copy.preferredFeet[value];
  }

  return copy.preferredFeet.both;
}