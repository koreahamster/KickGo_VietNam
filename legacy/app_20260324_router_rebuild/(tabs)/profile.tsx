import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PrimaryButton } from "@/components/PrimaryButton";
import {
  getAccountTypeOptions,
  getOptionLabel,
  LANGUAGE_OPTIONS,
} from "@/constants/profile-options";
import { COLORS } from "@/constants/colors";
import { SPACING } from "@/constants/spacing";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import type { SupportedAvatarContentType, SupportedLanguage } from "@/types/profile.types";

type AvatarCopy = {
  sectionTitle: string;
  helper: string;
  upload: string;
  uploading: string;
  updated: string;
  permissionDenied: string;
  unsupported: string;
  uploadFailed: string;
  noAvatar: string;
};

const AVATAR_COPY: Record<SupportedLanguage, AvatarCopy> = {
  ko: {
    sectionTitle: "아바타",
    helper: "프로필 사진을 선택해 계정 프로필에 반영합니다.",
    upload: "아바타 업로드",
    uploading: "업로드 중...",
    updated: "아바타가 업데이트되었습니다.",
    permissionDenied: "사진 보관함 접근 권한이 필요합니다.",
    unsupported: "JPG, PNG, WEBP, HEIC, HEIF 형식만 업로드할 수 있습니다.",
    uploadFailed: "아바타 업로드에 실패했습니다.",
    noAvatar: "등록된 아바타가 없습니다.",
  },
  vi: {
    sectionTitle: "Ảnh đại diện",
    helper: "Chọn ảnh hồ sơ để cập nhật tài khoản của bạn.",
    upload: "Tải ảnh đại diện",
    uploading: "Đang tải lên...",
    updated: "Đã cập nhật ảnh đại diện.",
    permissionDenied: "Cần quyền truy cập thư viện ảnh.",
    unsupported: "Chỉ hỗ trợ JPG, PNG, WEBP, HEIC hoặc HEIF.",
    uploadFailed: "Tải ảnh đại diện thất bại.",
    noAvatar: "Chưa có ảnh đại diện.",
  },
  en: {
    sectionTitle: "Avatar",
    helper: "Pick a profile photo and upload it to your account.",
    upload: "Upload avatar",
    uploading: "Uploading...",
    updated: "Avatar updated.",
    permissionDenied: "Photo library permission is required.",
    unsupported: "Only JPG, PNG, WEBP, HEIC, or HEIF files are supported.",
    uploadFailed: "Avatar upload failed.",
    noAvatar: "No avatar uploaded yet.",
  },
};

function getInitials(value: string): string {
  const normalized = value.trim();

  if (!normalized) {
    return "KG";
  }

  const tokens = normalized.split(/\s+/).slice(0, 2);
  const initials = tokens.map((token) => token[0]?.toUpperCase() ?? "").join("");

  return initials || normalized.slice(0, 2).toUpperCase();
}

function getAvatarContentType(
  asset: ImagePicker.ImagePickerAsset,
): SupportedAvatarContentType | null {
  const mimeType = asset.mimeType?.toLowerCase();

  if (mimeType === "image/jpeg" || mimeType === "image/png" || mimeType === "image/webp" || mimeType === "image/heic" || mimeType === "image/heif") {
    return mimeType;
  }

  const name = (asset.fileName ?? asset.uri).toLowerCase();

  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (name.endsWith(".png")) {
    return "image/png";
  }

  if (name.endsWith(".webp")) {
    return "image/webp";
  }

  if (name.endsWith(".heic")) {
    return "image/heic";
  }

  if (name.endsWith(".heif")) {
    return "image/heif";
  }

  return null;
}

function getAvatarFileName(
  asset: ImagePicker.ImagePickerAsset,
  contentType: SupportedAvatarContentType,
): string {
  if (asset.fileName) {
    return asset.fileName;
  }

  const extension = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : contentType === "image/heic" ? "heic" : contentType === "image/heif" ? "heif" : "jpg";
  return `avatar-${Date.now()}.${extension}`;
}

export default function ProfileTabScreen(): JSX.Element {
  const { language, t } = useI18n();
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const {
    hasProfile,
    isProfileLoading,
    isSubmittingProfile,
    pendingRoleOnboarding,
    profileBundle,
    profileErrorMessage,
    profileStatusMessage,
    uploadAvatar,
  } = useProfile({ enabled: isAuthenticated });
  const accountTypeOptions = useMemo(() => getAccountTypeOptions(language), [language]);
  const avatarCopy = AVATAR_COPY[language];
  const [avatarStatusMessage, setAvatarStatusMessage] = useState<string | null>(null);
  const [avatarErrorMessage, setAvatarErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isAuthLoading]);

  const handleUploadAvatar = async (): Promise<void> => {
    setAvatarErrorMessage(null);
    setAvatarStatusMessage(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setAvatarErrorMessage(avatarCopy.permissionDenied);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    const contentType = getAvatarContentType(asset);

    if (!contentType) {
      setAvatarErrorMessage(avatarCopy.unsupported);
      return;
    }

    try {
      await uploadAvatar({
        uri: asset.uri,
        fileName: getAvatarFileName(asset, contentType),
        contentType,
      });
      setAvatarStatusMessage(avatarCopy.updated);
    } catch (error: unknown) {
      setAvatarErrorMessage(error instanceof Error ? error.message : avatarCopy.uploadFailed);
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("profileTab.title")}</Text>
          <Text style={styles.description}>{t("profileTab.loadingDescription")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasProfile) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("profileTab.title")}</Text>
          <Text style={styles.description}>{t("profileTab.needProfileDescription")}</Text>
          <View style={styles.buttonGroup}>
            <PrimaryButton label={t("profileTab.createProfile")} onPress={() => router.push("/(onboarding)/create-profile")} />
            <PrimaryButton label={t("profileTab.phoneVerify")} onPress={() => router.push("/(auth)/phone-verify")} variant="secondary" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const profile = profileBundle.profile;
  const roles = profileBundle.accountTypes
    .map((role) => getOptionLabel(accountTypeOptions, role))
    .filter((value): value is string => Boolean(value));
  const displayName = profile?.display_name ?? user?.email ?? "KickGo";

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{t("profileTab.title")}</Text>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{avatarCopy.sectionTitle}</Text>
            <View style={styles.avatarRow}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitials}>{getInitials(displayName)}</Text>
                </View>
              )}
              <View style={styles.avatarMeta}>
                <Text style={styles.value}>{displayName}</Text>
                <Text style={styles.helperText}>{avatarCopy.helper}</Text>
                {!profile?.avatar_url ? (
                  <Text style={styles.helperText}>{avatarCopy.noAvatar}</Text>
                ) : null}
              </View>
            </View>
            <PrimaryButton
              label={isSubmittingProfile ? avatarCopy.uploading : avatarCopy.upload}
              onPress={() => void handleUploadAvatar()}
              isDisabled={isSubmittingProfile}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>{t("profileTab.name")}</Text>
            <Text style={styles.value}>{profile?.display_name ?? t("profileTab.notSet")}</Text>
            <Text style={styles.label}>{t("profileTab.email")}</Text>
            <Text style={styles.value}>{user?.email ?? t("profileTab.notSet")}</Text>
            <Text style={styles.label}>{t("profileTab.language")}</Text>
            <Text style={styles.value}>
              {getOptionLabel(LANGUAGE_OPTIONS, profile?.preferred_language ?? null) ?? t("profileTab.notSet")}
            </Text>
            <Text style={styles.label}>{t("profileTab.region")}</Text>
            <Text style={styles.value}>
              {profile?.province_code ?? t("profileTab.notSet")} / {profile?.district_code ?? t("profileTab.notSet")}
            </Text>
            <Text style={styles.label}>{t("profileTab.roles")}</Text>
            <Text style={styles.value}>{roles.length > 0 ? roles.join(", ") : t("profileTab.notSet")}</Text>
          </View>

          <View style={styles.buttonGroup}>
            <PrimaryButton
              label={t("profileTab.editProfile")}
              onPress={() => router.push("/(onboarding)/create-profile?mode=edit")}
            />
            {pendingRoleOnboarding.length > 0 ? (
              <PrimaryButton
                label={t("profileTab.continueRoleOnboarding")}
                onPress={() => router.push("/(onboarding)/role-onboarding")}
                variant="secondary"
              />
            ) : null}
            <PrimaryButton label={t("profileTab.settings")} onPress={() => router.push("/(settings)/settings")} variant="outline" />
          </View>

          {avatarErrorMessage ? <Text style={styles.errorText}>{avatarErrorMessage}</Text> : null}
          {!avatarErrorMessage && profileErrorMessage ? <Text style={styles.errorText}>{profileErrorMessage}</Text> : null}
          {avatarStatusMessage ? <Text style={styles.statusText}>{avatarStatusMessage}</Text> : null}
          {!avatarStatusMessage && profileStatusMessage ? <Text style={styles.statusText}>{profileStatusMessage}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingBottom: SPACING.xl },
  container: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  title: { fontSize: 30, fontWeight: "800", color: COLORS.textPrimary },
  description: { marginTop: SPACING.sm, fontSize: 15, lineHeight: 22, color: COLORS.textSecondary },
  card: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.textPrimary },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#ddd6c8",
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
  },
  avatarMeta: {
    flex: 1,
    gap: SPACING.sm,
  },
  label: { fontSize: 13, fontWeight: "700", color: COLORS.textMuted, textTransform: "uppercase" },
  value: { fontSize: 16, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  helperText: { fontSize: 13, lineHeight: 18, color: COLORS.textSecondary },
  buttonGroup: { marginTop: SPACING.xl, gap: SPACING.md },
  errorText: {
    marginTop: SPACING.lg,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: "#b83a3a",
  },
  statusText: {
    marginTop: SPACING.lg,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.brand,
  },
});




