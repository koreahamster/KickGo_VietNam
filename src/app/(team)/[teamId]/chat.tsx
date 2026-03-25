import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useI18n } from "@/core/i18n/LanguageProvider";
import { getTeamChatCopy } from "@/core/i18n/team-chat-copy";
import { useTeamChat } from "@/hooks/useTeamChat";
import { useTeamDetail } from "@/hooks/useTeamDetail";
import type { SupportedLanguage } from "@/types/profile.types";
import type { TeamChatAttachmentInput, TeamChatMessageRecord } from "@/types/team-chat.types";

type ChatRenderItem =
  | { type: "date"; key: string; label: string }
  | { type: "message"; key: string; message: TeamChatMessageRecord };

function getLocale(language: SupportedLanguage): string {
  if (language === "ko") {
    return "ko-KR";
  }

  if (language === "vi") {
    return "vi-VN";
  }

  return "en-US";
}

function formatDateLabel(value: string, language: SupportedLanguage): string {
  return new Intl.DateTimeFormat(getLocale(language), {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(new Date(value));
}

function formatTimeLabel(value: string, language: SupportedLanguage): string {
  return new Intl.DateTimeFormat(getLocale(language), {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function toRenderItems(messagesDescending: TeamChatMessageRecord[], language: SupportedLanguage): ChatRenderItem[] {
  const ascending = [...messagesDescending].reverse();
  const items: ChatRenderItem[] = [];
  let previousDayKey: string | null = null;

  ascending.forEach((message) => {
    const dayKey = new Date(message.created_at).toISOString().slice(0, 10);

    if (dayKey !== previousDayKey) {
      items.push({
        type: "date",
        key: `date-${dayKey}`,
        label: formatDateLabel(message.created_at, language),
      });
      previousDayKey = dayKey;
    }

    items.push({
      type: "message",
      key: message.id,
      message,
    });
  });

  return items;
}

function getAttachmentContentType(asset: ImagePicker.ImagePickerAsset): TeamChatAttachmentInput["contentType"] {
  const mimeType = asset.mimeType?.toLowerCase();

  if (mimeType === "image/png") {
    return "image/png";
  }

  if (mimeType === "image/webp") {
    return "image/webp";
  }

  if (mimeType === "image/heic") {
    return "image/heic";
  }

  if (mimeType === "image/heif") {
    return "image/heif";
  }

  return "image/jpeg";
}

export default function TeamChatScreen(): JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams<{ teamId?: string | string[] }>();
  const teamId = useMemo(() => {
    if (Array.isArray(params.teamId)) {
      return params.teamId[0] ?? null;
    }

    return params.teamId ?? null;
  }, [params.teamId]);
  const { language } = useI18n();
  const copy = getTeamChatCopy(language);
  const { teamDetail, isTeamDetailLoading } = useTeamDetail(teamId);
  const {
    currentUserId,
    messages,
    isTeamChatLoading,
    teamChatErrorMessage,
    hasNextPage,
    isFetchingNextPage,
    isSendingMessage,
    loadOlderMessages,
    sendMessage,
    refetchMessages,
  } = useTeamChat(teamId);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<TeamChatAttachmentInput | null>(null);
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);
  const renderItems = useMemo(() => toRenderItems(messages, language), [language, messages]);

  const handlePickImage = async (): Promise<void> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
      allowsMultipleSelection: false,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `team-chat-${Date.now()}.jpg`;

    setAttachment({
      uri: asset.uri,
      fileName,
      contentType: getAttachmentContentType(asset),
    });
  };

  const handleSendMessage = async (): Promise<void> => {
    if (!teamId) {
      return;
    }

    await sendMessage({
      teamId,
      messageText: draft,
      attachment,
    });

    setDraft("");
    setAttachment(null);
  };

  const handleScroll = async (offsetY: number): Promise<void> => {
    if (offsetY > 80) {
      return;
    }

    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    await loadOlderMessages();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 8, default: 0 })}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonLabel}>{copy.backToTeam}</Text>
            </TouchableOpacity>
            <View style={styles.headerTextWrap}>
              <Text style={styles.headerTitle}>{copy.title}</Text>
              <Text style={styles.headerSubtitle}>
                {teamDetail?.team.name ?? (isTeamDetailLoading ? "..." : copy.subtitle)}
              </Text>
            </View>
          </View>
        </View>

        {teamChatErrorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>{teamChatErrorMessage}</Text>
            <TouchableOpacity onPress={() => void refetchMessages()} style={styles.retryButton}>
              <Text style={styles.retryButtonLabel}>{copy.retry}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <FlatList
          data={renderItems}
          keyExtractor={(item) => item.key}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            renderItems.length === 0 ? styles.emptyListContent : null,
          ]}
          keyboardShouldPersistTaps="handled"
          maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
          onScroll={(event) => {
            void handleScroll(event.nativeEvent.contentOffset.y);
          }}
          scrollEventThrottle={16}
          ListHeaderComponent={
            hasNextPage ? (
              <View style={styles.loadPreviousWrap}>
                <Text style={styles.loadPreviousText}>
                  {isFetchingNextPage ? copy.loadingPrevious : copy.loadPrevious}
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            isTeamChatLoading ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>...</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
                <Text style={styles.emptySubtitle}>{copy.emptySubtitle}</Text>
              </View>
            )
          }
          renderItem={({ item }) => {
            if (item.type === "date") {
              return (
                <View style={styles.dateSeparatorWrap}>
                  <View style={styles.dateSeparatorLine} />
                  <Text style={styles.dateSeparatorLabel}>{item.label}</Text>
                  <View style={styles.dateSeparatorLine} />
                </View>
              );
            }

            const message = item.message;
            const isOwnMessage = message.user_id === currentUserId;
            const senderName = message.profile?.display_name || "Player";
            const avatarUrl = message.profile?.avatar_url;

            return (
              <View style={[styles.messageRow, isOwnMessage ? styles.messageRowOwn : null]}>
                {!isOwnMessage ? (
                  avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarFallbackLabel}>{senderName.slice(0, 1).toUpperCase()}</Text>
                    </View>
                  )
                ) : null}

                <View style={[styles.messageColumn, isOwnMessage ? styles.messageColumnOwn : null]}>
                  {!isOwnMessage ? <Text style={styles.senderLabel}>{senderName}</Text> : null}

                  <View style={[styles.messageBubble, isOwnMessage ? styles.messageBubbleOwn : styles.messageBubbleOther]}>
                    {message.image_url ? (
                      <Pressable onPress={() => setViewerImageUrl(message.image_url)}>
                        <Image source={{ uri: message.image_url }} style={styles.messageImage} />
                      </Pressable>
                    ) : null}
                    {message.message_text ? (
                      <Text style={[styles.messageText, isOwnMessage ? styles.messageTextOwn : null]}>{message.message_text}</Text>
                    ) : null}
                  </View>

                  <Text style={[styles.messageTime, isOwnMessage ? styles.messageTimeOwn : null]}>
                    {formatTimeLabel(message.created_at, language)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.composerWrap}>
          {attachment ? (
            <View style={styles.attachmentPreview}>
              <Image source={{ uri: attachment.uri }} style={styles.attachmentPreviewImage} />
              <View style={styles.attachmentPreviewBody}>
                <Text style={styles.attachmentPreviewLabel}>{copy.attachedImage}</Text>
                <Text style={styles.attachmentPreviewName} numberOfLines={1}>
                  {attachment.fileName}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setAttachment(null)} style={styles.attachmentRemoveButton}>
                <Text style={styles.attachmentRemoveButtonLabel}>{copy.removeImage}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.composerRow}>
            <TouchableOpacity onPress={() => void handlePickImage()} style={styles.attachButton}>
              <Text style={styles.attachButtonLabel}>{copy.attachImage}</Text>
            </TouchableOpacity>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder={copy.inputPlaceholder}
              placeholderTextColor="#8a928b"
              style={styles.textInput}
              multiline
            />
            <TouchableOpacity
              onPress={() => void handleSendMessage()}
              style={[styles.sendButton, isSendingMessage ? styles.sendButtonDisabled : null]}
              disabled={isSendingMessage}
            >
              <Text style={styles.sendButtonLabel}>{isSendingMessage ? copy.sending : copy.send}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={viewerImageUrl !== null} transparent animationType="fade" onRequestClose={() => setViewerImageUrl(null)}>
        <View style={styles.viewerBackdrop}>
          <Pressable style={styles.viewerBackdropTouch} onPress={() => setViewerImageUrl(null)}>
            {viewerImageUrl ? <Image source={{ uri: viewerImageUrl }} style={styles.viewerImage} resizeMode="contain" /> : null}
          </Pressable>
          <TouchableOpacity onPress={() => setViewerImageUrl(null)} style={styles.viewerCloseButton}>
            <Text style={styles.viewerCloseButtonLabel}>{copy.closeViewer}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3efe6",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  headerCard: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
    padding: 18,
    borderRadius: 24,
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#d8d1c5",
  },
  headerRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#c9c1b4",
    backgroundColor: "#f8f4ec",
  },
  backButtonLabel: {
    color: "#10231f",
    fontSize: 14,
    fontWeight: "700",
  },
  headerTextWrap: {
    flex: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#10231f",
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#5a6764",
  },
  errorCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#fff4ef",
    borderWidth: 1,
    borderColor: "#f0cabd",
    gap: 12,
  },
  errorTitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#8a3b28",
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#10231f",
  },
  retryButtonLabel: {
    color: "#fff",
    fontWeight: "700",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  loadPreviousWrap: {
    paddingVertical: 8,
    alignItems: "center",
  },
  loadPreviousText: {
    color: "#67726f",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#10231f",
  },
  emptySubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#67726f",
    maxWidth: 280,
  },
  dateSeparatorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd6ca",
  },
  dateSeparatorLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7b857f",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  messageRowOwn: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d9d1c4",
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dfe9df",
  },
  avatarFallbackLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1d6b57",
  },
  messageColumn: {
    maxWidth: "82%",
    gap: 4,
  },
  messageColumnOwn: {
    alignItems: "flex-end",
  },
  senderLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6e7872",
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  messageBubbleOwn: {
    backgroundColor: "#10231f",
    borderBottomRightRadius: 6,
  },
  messageBubbleOther: {
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#d8d1c5",
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#10231f",
  },
  messageTextOwn: {
    color: "#fff",
  },
  messageImage: {
    width: 220,
    height: 160,
    borderRadius: 14,
    backgroundColor: "#d5ddd7",
  },
  messageTime: {
    fontSize: 11,
    color: "#7b857f",
  },
  messageTimeOwn: {
    textAlign: "right",
  },
  composerWrap: {
    borderTopWidth: 1,
    borderTopColor: "#ddd6ca",
    backgroundColor: "#f8f4ec",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.select({ ios: 22, default: 14 }),
    gap: 10,
  },
  attachmentPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#d8d1c5",
  },
  attachmentPreviewImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#d5ddd7",
  },
  attachmentPreviewBody: {
    flex: 1,
    gap: 4,
  },
  attachmentPreviewLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6f7973",
  },
  attachmentPreviewName: {
    fontSize: 14,
    color: "#10231f",
  },
  attachmentRemoveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f0e6dd",
  },
  attachmentRemoveButtonLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#91533b",
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  attachButton: {
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2ece4",
  },
  attachButtonLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1d6b57",
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "#fffdf8",
    borderWidth: 1,
    borderColor: "#d8d1c5",
    color: "#10231f",
    textAlignVertical: "top",
  },
  sendButton: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1d6b57",
  },
  sendButtonDisabled: {
    opacity: 0.65,
  },
  sendButtonLabel: {
    color: "#fff",
    fontWeight: "800",
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
  },
  viewerBackdropTouch: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  viewerImage: {
    width: "100%",
    height: "100%",
  },
  viewerCloseButton: {
    position: "absolute",
    top: 48,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  viewerCloseButtonLabel: {
    color: "#fff",
    fontWeight: "700",
  },
});