import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import {
  PROFILE_HEADER_BG,
  PROFILE_TAG_BG,
  PROFILE_TEXT_DARK,
  getInitials,
} from "@/components/profile/profileShared";

type ProfileHeroHeaderProps = {
  displayName: string;
  badgeLabel: string;
  tags: string[];
  avatarUrl: string | null;
  onBack: () => void;
  onShare: () => void;
  onNotifications: () => void;
  onSettings: () => void;
  onEdit: () => void;
  onUploadAvatar: () => void;
};

export function ProfileHeroHeader(props: ProfileHeroHeaderProps): JSX.Element {
  const { displayName, badgeLabel, tags, avatarUrl, onBack, onShare, onNotifications, onSettings, onEdit, onUploadAvatar } = props;

  return (
    <View style={styles.headerBlock}>
      <View style={styles.headerActionsRow}>
        <Pressable hitSlop={12} onPress={onBack} style={styles.iconButton}>
          <Ionicons color="#ffffff" name="chevron-back" size={24} />
        </Pressable>
        <View style={styles.headerRightActions}>
          <Pressable hitSlop={12} onPress={onShare} style={styles.iconButton}>
            <Ionicons color="#ffffff" name="share-social-outline" size={22} />
          </Pressable>
          <Pressable hitSlop={12} onPress={onNotifications} style={styles.iconButton}>
            <Ionicons color="#ffffff" name="notifications-outline" size={22} />
          </Pressable>
          <Pressable hitSlop={12} onPress={onSettings} style={styles.iconButton}>
            <Ionicons color="#ffffff" name="settings-outline" size={22} />
          </Pressable>
        </View>
      </View>

      <View style={styles.profileHeroRow}>
        <View style={styles.heroTextBlock}>
          <Pressable onPress={onEdit} style={styles.nameRow}>
            <Text style={styles.heroName}>{displayName}</Text>
            <Ionicons color="#ffffff" name="chevron-forward" size={18} />
          </Pressable>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeLabel}>{badgeLabel}</Text>
          </View>
          <View style={styles.tagRow}>
            {tags.filter(Boolean).map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagLabel}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackLabel}>{getInitials(displayName)}</Text>
            </View>
          )}
          <Pressable onPress={onUploadAvatar} style={styles.cameraButton}>
            <Ionicons color={PROFILE_TEXT_DARK} name="camera-outline" size={16} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    backgroundColor: PROFILE_HEADER_BG,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 96,
  },
  headerActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconButton: {
    minWidth: 28,
    minHeight: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  profileHeroRow: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  heroTextBlock: {
    flex: 1,
    gap: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroName: {
    flexShrink: 1,
    fontSize: 38,
    fontWeight: "900",
    color: "#ffffff",
  },
  statusBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: PROFILE_TAG_BG,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusBadgeLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagPill: {
    borderRadius: 14,
    backgroundColor: PROFILE_TAG_BG,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tagLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  avatarWrap: {
    position: "relative",
    marginTop: 8,
  },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: "#ffffff",
    backgroundColor: "#d9d9d9",
  },
  avatarFallback: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: "#ffffff",
    backgroundColor: "#d8b4fe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarFallbackLabel: {
    fontSize: 34,
    fontWeight: "800",
    color: PROFILE_TEXT_DARK,
  },
  cameraButton: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
});

