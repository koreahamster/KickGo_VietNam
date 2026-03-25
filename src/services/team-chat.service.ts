import type { RealtimeChannel } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import type {
  SendTeamChatMessageInput,
  TeamChatMessagePage,
  TeamChatMessageRecord,
  TeamChatProfileRecord,
} from "@/types/team-chat.types";

type RawTeamChatMessageRow = {
  id: string;
  team_id: string;
  user_id: string;
  message_text: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
  profile: TeamChatProfileRecord | TeamChatProfileRecord[] | null;
};

const PAGE_SIZE = 20;

function normalizeProfile(
  value: TeamChatProfileRecord | TeamChatProfileRecord[] | null,
): TeamChatProfileRecord | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

function mapMessageRow(row: RawTeamChatMessageRow): TeamChatMessageRecord {
  const imageUrl = row.image_path
    ? supabase.storage.from("team-chat").getPublicUrl(row.image_path).data.publicUrl
    : null;

  return {
    id: row.id,
    team_id: row.team_id,
    user_id: row.user_id,
    message_text: row.message_text,
    image_path: row.image_path,
    image_url: imageUrl,
    created_at: row.created_at,
    updated_at: row.updated_at,
    profile: normalizeProfile(row.profile),
  };
}

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  if (!user) {
    throw new Error("Authenticated user was not found.");
  }

  return user.id;
}

function sanitizeMessageText(value: string): string {
  return value.trim();
}

function generateMessageId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const random = Math.random().toString(36).slice(2, 10);
  return `msg-${Date.now()}-${random}`;
}

function getFileExtension(fileName: string, contentType: string): string {
  const extensionFromName = fileName.split(".").pop()?.trim().toLowerCase();

  if (extensionFromName) {
    return extensionFromName;
  }

  if (contentType === "image/png") {
    return "png";
  }

  if (contentType === "image/webp") {
    return "webp";
  }

  if (contentType === "image/heic") {
    return "heic";
  }

  if (contentType === "image/heif") {
    return "heif";
  }

  return "jpg";
}

async function readLocalFile(uri: string): Promise<Blob> {
  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error("Failed to read the selected image.");
  }

  return response.blob();
}

export async function fetchTeamChatMessages(
  teamId: string,
  beforeCreatedAt: string | null,
): Promise<TeamChatMessagePage> {
  let query = supabase
    .from("team_chat_messages")
    .select(
      "id, team_id, user_id, message_text, image_path, created_at, updated_at, profile:profiles!team_chat_messages_user_id_fkey(id, display_name, avatar_url)",
    )
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (beforeCreatedAt) {
    query = query.lt("created_at", beforeCreatedAt);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = ((data ?? []) as RawTeamChatMessageRow[]).map((row) => mapMessageRow(row));

  return {
    messages: rows,
    nextCursor: rows.length === PAGE_SIZE ? rows[rows.length - 1]?.created_at ?? null : null,
  };
}

export async function getTeamChatMessageById(messageId: string): Promise<TeamChatMessageRecord | null> {
  const { data, error } = await supabase
    .from("team_chat_messages")
    .select(
      "id, team_id, user_id, message_text, image_path, created_at, updated_at, profile:profiles!team_chat_messages_user_id_fkey(id, display_name, avatar_url)",
    )
    .eq("id", messageId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  return mapMessageRow(data as RawTeamChatMessageRow);
}

export async function sendTeamChatMessage(input: SendTeamChatMessageInput): Promise<TeamChatMessageRecord> {
  const userId = await getAuthenticatedUserId();
  const messageText = sanitizeMessageText(input.messageText);

  if (!messageText && !input.attachment) {
    throw new Error("Message text or an image attachment is required.");
  }

  const messageId = generateMessageId();
  let imagePath: string | null = null;

  if (input.attachment) {
    const blob = await readLocalFile(input.attachment.uri);
    const extension = getFileExtension(input.attachment.fileName, input.attachment.contentType);
    imagePath = `${input.teamId}/${messageId}.${extension}`;

    const uploadResult = await supabase.storage.from("team-chat").upload(imagePath, blob, {
      contentType: input.attachment.contentType,
      upsert: false,
    });

    if (uploadResult.error) {
      throw new Error(uploadResult.error.message);
    }
  }

  const insertResult = await supabase
    .from("team_chat_messages")
    .insert({
      id: messageId,
      team_id: input.teamId,
      user_id: userId,
      message_text: messageText ? messageText : null,
      image_path: imagePath,
    })
    .select(
      "id, team_id, user_id, message_text, image_path, created_at, updated_at, profile:profiles!team_chat_messages_user_id_fkey(id, display_name, avatar_url)",
    )
    .single();

  if (insertResult.error) {
    throw new Error(insertResult.error.message);
  }

  return mapMessageRow(insertResult.data as RawTeamChatMessageRow);
}

export function subscribeToTeamChatMessages(
  teamId: string,
  onInsert: (messageId: string) => void,
): () => void {
  const channel: RealtimeChannel = supabase
    .channel(`team-chat:${teamId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "team_chat_messages",
        filter: `team_id=eq.${teamId}`,
      },
      (payload) => {
        const insertedMessageId = (payload.new as { id?: string }).id;

        if (typeof insertedMessageId === "string") {
          onInsert(insertedMessageId);
        }
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}