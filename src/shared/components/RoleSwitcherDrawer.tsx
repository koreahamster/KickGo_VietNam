import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP_FONT_FAMILY } from "@/constants/typography";
import { getRoleLabel, getRoleSwitcherCopy } from "@/constants/role-switcher";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { useProfile } from "@/hooks/useProfile";
import { signOut } from "@/services/auth.service";
import { useRoleSwitchStore, type ActiveRole } from "@/store/role-switch.store";

const DRAWER_WIDTH = 308;

function buildInitials(name: string | null | undefined): string {
  if (!name) {
    return "KG";
  }

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk.charAt(0).toUpperCase())
    .join("");
}

function RoleRow(props: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
}): JSX.Element {
  const { label, icon, isActive, onPress } = props;

  return (
    <Pressable onPress={onPress} style={[styles.rowButton, isActive ? styles.rowButtonActive : null]}>
      <View style={styles.rowLabelWrap}>
        <Ionicons color={isActive ? "#ffffff" : "#10231f"} name={icon} size={18} />
        <Text style={[styles.rowLabel, isActive ? styles.rowLabelActive : null]}>{label}</Text>
      </View>
      {isActive ? <Ionicons color="#ffffff" name="checkmark-circle" size={18} /> : null}
    </Pressable>
  );
}

function MenuRow(props: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  destructive?: boolean;
}): JSX.Element {
  const { label, icon, onPress, destructive } = props;

  return (
    <Pressable onPress={onPress} style={styles.menuRow}>
      <View style={styles.rowLabelWrap}>
        <Ionicons color={destructive ? "#be3a34" : "#1d2d29"} name={icon} size={18} />
        <Text style={[styles.menuLabel, destructive ? styles.menuLabelDanger : null]}>{label}</Text>
      </View>
      <Ionicons color="#87918e" name="chevron-forward" size={18} />
    </Pressable>
  );
}

export function RoleSwitcherDrawer(): JSX.Element {
  const { language } = useI18n();
  const copy = getRoleSwitcherCopy(language);
  const { profileBundle, accountTypes, isProfileLoading } = useProfile();
  const activeRole = useRoleSwitchStore((state) => state.activeRole);
  const availableRoles = useRoleSwitchStore((state) => state.availableRoles);
  const isDrawerOpen = useRoleSwitchStore((state) => state.isDrawerOpen);
  const setActiveRole = useRoleSwitchStore((state) => state.setActiveRole);
  const setAvailableRoles = useRoleSwitchStore((state) => state.setAvailableRoles);
  const closeDrawer = useRoleSwitchStore((state) => state.closeDrawer);

  const [isMounted, setIsMounted] = useState<boolean>(isDrawerOpen);
  const slide = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    if (accountTypes.length > 0) {
      setAvailableRoles(accountTypes);
    }
  }, [accountTypes, setAvailableRoles]);

  useEffect(() => {
    if (isDrawerOpen) {
      setIsMounted(true);
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(slide, {
      toValue: -DRAWER_WIDTH,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsMounted(false);
      }
    });
  }, [isDrawerOpen, slide]);

  const rolesToRender = useMemo<ActiveRole[]>(() => {
    return accountTypes.length > 0 ? accountTypes : availableRoles;
  }, [accountTypes, availableRoles]);

  const profileName = profileBundle.profile?.display_name ?? copy.guestName;
  const avatarUrl = profileBundle.profile?.avatar_url ?? null;

  const goTo = (href: Parameters<typeof router.push>[0]): void => {
    closeDrawer();
    router.push(href);
  };

  const handleRoleChange = (role: ActiveRole): void => {
    setActiveRole(role);
    closeDrawer();
    router.replace("/");
  };

  const handleLogout = async (): Promise<void> => {
    closeDrawer();
    await signOut();
    router.replace("/");
  };

  if (!isMounted) {
    return <></>;
  }

  return (
    <Modal animationType="none" onRequestClose={closeDrawer} transparent visible={isMounted}>
      <View style={styles.overlay}>
        <Pressable onPress={closeDrawer} style={styles.scrim} />
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slide }] }]}> 
          <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
            <View style={styles.titleRow}>
              <Text style={styles.drawerTitle}>{copy.title}</Text>
              <Pressable hitSlop={8} onPress={closeDrawer}>
                <Ionicons color="#10231f" name="close-outline" size={24} />
              </Pressable>
            </View>

            <View style={styles.header}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>{buildInitials(profileName)}</Text>
                </View>
              )}
              <View style={styles.headerCopy}>
                <Text style={styles.profileName}>{profileName}</Text>
                <Text style={styles.profileRoleLabel}>{copy.currentRole}</Text>
                <Text style={styles.profileRoleValue}>{getRoleLabel(language, activeRole)}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{copy.roleSectionTitle}</Text>
              {isProfileLoading ? <Text style={styles.helper}>{copy.loadingProfile}</Text> : null}
              {rolesToRender.map((role) => (
                <RoleRow
                  icon={role === "player" ? "person-outline" : role === "referee" ? "shield-checkmark-outline" : "business-outline"}
                  isActive={activeRole === role}
                  key={role}
                  label={getRoleLabel(language, role)}
                  onPress={() => handleRoleChange(role)}
                />
              ))}
              <Pressable onPress={() => goTo("/(settings)/roles")} style={styles.addRoleButton}>
                <Ionicons color="#1d6b57" name="add-circle-outline" size={18} />
                <Text style={styles.addRoleLabel}>{copy.addRole}</Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{copy.menuSectionTitle}</Text>
              <MenuRow icon="notifications-outline" label={copy.notifications} onPress={() => goTo("/notifications")} />
              <MenuRow icon="language-outline" label={copy.language} onPress={() => goTo("/(settings)/language")} />
              <MenuRow icon="document-text-outline" label={copy.privacyPolicy} onPress={() => goTo("/(settings)/privacy-policy")} />
              <MenuRow destructive icon="log-out-outline" label={copy.logout} onPress={() => void handleLogout()} />
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(10, 18, 17, 0.28)",
  },
  scrim: {
    flex: 1,
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: "#fffdf8",
    borderRightWidth: 1,
    borderRightColor: "#d8d1c5",
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 4, height: 0 },
    elevation: 10,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  drawerTitle: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 24,
    fontWeight: "800",
    color: "#10231f",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ebe4d8",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#d8d1c5",
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10231f",
  },
  avatarFallbackText: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 20,
    fontWeight: "800",
    color: "#10231f",
  },
  profileRoleLabel: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 12,
    color: "#7b837f",
  },
  profileRoleValue: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 14,
    fontWeight: "700",
    color: "#1d6b57",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 13,
    fontWeight: "800",
    color: "#7b837f",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  helper: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    color: "#6c7471",
    fontSize: 13,
  },
  rowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d8d1c5",
    backgroundColor: "#ffffff",
  },
  rowButtonActive: {
    backgroundColor: "#10231f",
    borderColor: "#10231f",
  },
  rowLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rowLabel: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 15,
    fontWeight: "700",
    color: "#10231f",
  },
  rowLabelActive: {
    color: "#ffffff",
  },
  addRoleButton: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  addRoleLabel: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 14,
    fontWeight: "700",
    color: "#1d6b57",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0ebe2",
  },
  menuLabel: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 15,
    fontWeight: "600",
    color: "#1d2d29",
  },
  menuLabelDanger: {
    color: "#be3a34",
  },
});