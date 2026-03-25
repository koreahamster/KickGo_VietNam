import type { SupportedLanguage } from "@/types/profile.types";

export type TeamChatCopy = {
  title: string;
  subtitle: string;
  emptyTitle: string;
  emptySubtitle: string;
  inputPlaceholder: string;
  attachImage: string;
  removeImage: string;
  attachedImage: string;
  send: string;
  sending: string;
  retry: string;
  loadPrevious: string;
  loadingPrevious: string;
  memberOnlyError: string;
  backToTeam: string;
  closeViewer: string;
};

const KO: TeamChatCopy = {
  title: "\uD300 \uCC44\uD305",
  subtitle: "\uD300\uC6D0\uB4E4\uACFC \uC2E4\uC2DC\uAC04\uC73C\uB85C \uBA54\uC2DC\uC9C0\uB97C \uC8FC\uACE0\uBC1B\uC73C\uC138\uC694.",
  emptyTitle: "\uC544\uC9C1 \uBA54\uC2DC\uC9C0\uAC00 \uC5C6\uC5B4\uC694",
  emptySubtitle: "\uCCAB \uBA54\uC2DC\uC9C0\uB97C \uBCF4\uB0B4 \uD300 \uCC44\uD305\uC744 \uC2DC\uC791\uD558\uC138\uC694.",
  inputPlaceholder: "\uBA54\uC2DC\uC9C0\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694",
  attachImage: "\uC774\uBBF8\uC9C0 \uCCA8\uBD80",
  removeImage: "\uCCA8\uBD80 \uCDE8\uC18C",
  attachedImage: "\uCCA8\uBD80\uB41C \uC774\uBBF8\uC9C0",
  send: "\uC804\uC1A1",
  sending: "\uC804\uC1A1 \uC911...",
  retry: "\uB2E4\uC2DC \uC2DC\uB3C4",
  loadPrevious: "\uC774\uC804 \uBA54\uC2DC\uC9C0 \uB354 \uBCF4\uAE30",
  loadingPrevious: "\uC774\uC804 \uBA54\uC2DC\uC9C0 \uBD88\uB7EC\uC624\uB294 \uC911...",
  memberOnlyError: "\uD300 \uCC44\uD305\uC740 \uD65C\uC131 \uD300\uC6D0\uB9CC \uC774\uC6A9\uD560 \uC218 \uC788\uC5B4\uC694.",
  backToTeam: "\uD300 \uC0C1\uC138\uB85C",
  closeViewer: "\uB2EB\uAE30",
};

const EN: TeamChatCopy = {
  title: "Team Chat",
  subtitle: "Chat with your teammates in realtime.",
  emptyTitle: "No messages yet",
  emptySubtitle: "Send the first message to start the team chat.",
  inputPlaceholder: "Type a message",
  attachImage: "Attach image",
  removeImage: "Remove",
  attachedImage: "Attached image",
  send: "Send",
  sending: "Sending...",
  retry: "Retry",
  loadPrevious: "Load older messages",
  loadingPrevious: "Loading older messages...",
  memberOnlyError: "Only active team members can use team chat.",
  backToTeam: "Back to team",
  closeViewer: "Close",
};

const COPY: Record<SupportedLanguage, TeamChatCopy> = {
  ko: KO,
  vi: EN,
  en: EN,
};

export function getTeamChatCopy(language: SupportedLanguage): TeamChatCopy {
  return COPY[language];
}