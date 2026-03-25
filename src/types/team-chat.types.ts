export type TeamChatImageContentType = "image/jpeg" | "image/png" | "image/webp" | "image/heic" | "image/heif";

export type TeamChatProfileRecord = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
};

export type TeamChatMessageRecord = {
  id: string;
  team_id: string;
  user_id: string;
  message_text: string | null;
  image_path: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  profile: TeamChatProfileRecord | null;
};

export type TeamChatMessagePage = {
  messages: TeamChatMessageRecord[];
  nextCursor: string | null;
};

export type TeamChatAttachmentInput = {
  uri: string;
  fileName: string;
  contentType: TeamChatImageContentType;
};

export type SendTeamChatMessageInput = {
  teamId: string;
  messageText: string;
  attachment?: TeamChatAttachmentInput | null;
};