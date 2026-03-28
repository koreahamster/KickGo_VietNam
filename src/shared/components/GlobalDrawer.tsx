import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { APP_FONT_FAMILY } from "@/constants/typography";
import { getRoleLabel } from "@/constants/role-switcher";
import { useI18n } from "@/core/i18n/LanguageProvider";
import { getGlobalDrawerCopy } from "@/features/global-drawer/global-drawer.copy";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/services/auth.service";
import { useBootstrapStore } from "@/store/bootstrap.store";
import { useDrawerStore } from "@/store/drawer.store";
import { useRoleSwitchStore, type ActiveRole } from "@/store/role-switch.store";
import type { AccountType, SupportedLanguage } from "@/types/profile.types";

const DRAWER_WIDTH = Math.min(Dimensions.get("window").width * 0.8, 360);
const VERSION = Constants.expoConfig?.version ?? "1.0.0";

type RoleRowProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
};

type MenuRowProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type LanguageOptionProps = {
  flag: string;
  label: string;
  value: SupportedLanguage;
  selected: boolean;
  onPress: (value: SupportedLanguage) => void;
};

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

function getRoleIcon(role: AccountType): keyof typeof Ionicons.glyphMap {
  if (role === "player") {
    return "person-outline";
  }

  if (role === "referee") {
    return "shield-checkmark-outline";
  }

  return "business-outline";
}

function getLanguageFlag(language: SupportedLanguage): string {
  if (language === "ko") {
    return "KO";
  }

  if (language === "vi") {
    return "VI";
  }

  return "EN";
}

function getLanguageLabel(language: SupportedLanguage, copy: ReturnType<typeof getGlobalDrawerCopy>): string {
  if (language === "ko") {
    return copy.languageKo;
  }

  if (language === "vi") {
    return copy.languageVi;
  }

  return copy.languageEn;
}

function RoleRow(props: RoleRowProps): JSX.Element {
  const { label, icon, isActive, onPress } = props;

  return (
    <Pressable onPress={onPress} style={[styles.roleRow, isActive ? styles.roleRowActive : null]}>
      <View style={styles.rowLabelWrap}>
        <Ionicons color={isActive ? "#ffffff" : "#c7d1de"} name={icon} size={18} />
        <Text style={[styles.roleRowLabel, isActive ? styles.roleRowLabelActive : null]}>{label}</Text>
      </View>
      {isActive ? <Ionicons color="#22c55e" name="checkmark-circle" size={18} /> : null}
    </Pressable>
  );
}

function MenuRow(props: MenuRowProps): JSX.Element {
  const { label, icon, onPress } = props;

  return (
    <Pressable onPress={onPress} style={styles.menuRow}>
      <View style={styles.rowLabelWrap}>
        <Ionicons color="#d8e1ef" name={icon} size={18} />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Ionicons color="#7d8897" name="chevron-forward" size={18} />
    </Pressable>
  );
}

function LanguageOption(props: LanguageOptionProps): JSX.Element {
  const { flag, label, value, selected, onPress } = props;

  return (
    <Pressable onPress={() => onPress(value)} style={[styles.languageOption, selected ? styles.languageOptionSelected : null]}>
      <Text style={styles.languageOptionFlag}>{flag}</Text>
      <Text style={[styles.languageOptionLabel, selected ? styles.languageOptionLabelSelected : null]}>{label}</Text>
      {selected ? <Ionicons color="#22c55e" name="checkmark-circle" size={18} /> : null}
    </Pressable>
  );
}

export function GlobalDrawer(): JSX.Element {
  const { user } = useAuth();
  const { language, setLanguage } = useI18n();
  const copy = getGlobalDrawerCopy(language);
  const bootstrapData = useBootstrapStore((state) => state.bootstrapData);
  const activeRole = useRoleSwitchStore((state) => state.activeRole);
  const availableRoles = useRoleSwitchStore((state) => state.availableRoles);
  const setActiveRole = useRoleSwitchStore((state) => state.setActiveRole);
  const isDrawerOpen = useDrawerStore((state) => state.isDrawerOpen);
  const closeDrawer = useDrawerStore((state) => state.closeDrawer);
  const [isMounted, setIsMounted] = useState<boolean>(isDrawerOpen);
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);
  const slide = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

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

  const rolesToRender = useMemo<AccountType[]>(() => {
    if (!user?.id) {
      return [];
    }

    const bootstrapRoles = bootstrapData?.account_types ?? [];
    return bootstrapRoles.length > 0 ? bootstrapRoles : availableRoles;
  }, [availableRoles, bootstrapData?.account_types, user?.id]);

  const profileName = bootstrapData?.profile?.display_name ?? copy.guestName;
  const avatarUrl = bootstrapData?.profile?.avatar_url ?? null;
  const currentRoleLabel = activeRole ? getRoleLabel(language, activeRole) : copy.roleNone;
  const currentLanguageLabel = `${getLanguageFlag(language)} ${getLanguageLabel(language, copy)}`;

  const navigate = (href: Parameters<typeof router.push>[0]): void => {
    closeDrawer();
    router.push(href);
  };

  const handleRoleChange = (role: ActiveRole): void => {
    setActiveRole(role);
    closeDrawer();
    router.replace("/");
  };

  const handleLanguageChange = async (nextLanguage: SupportedLanguage): Promise<void> => {
    await setLanguage(nextLanguage);
    setIsLanguageSheetOpen(false);
    closeDrawer();
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
    <>
      <Modal animationType="none" onRequestClose={closeDrawer} transparent visible={isMounted}>
        <View style={styles.overlay}>
          <Pressable onPress={closeDrawer} style={styles.scrim} />
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slide }] }]}>
            <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
              <View style={styles.header}>
                <View style={styles.profileRow}>
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarFallbackText}>{buildInitials(profileName)}</Text>
                    </View>
                  )}
                  <View style={styles.profileCopy}>
                    <Text numberOfLines={1} style={styles.profileName}>{profileName}</Text>
                    <Text style={styles.profileRoleCaption}>{copy.currentRole}</Text>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeLabel}>{currentRoleLabel}</Text>
                    </View>
                  </View>
                </View>
                <Pressable hitSlop={10} onPress={closeDrawer} style={styles.closeButton}>
                  <Ionicons color="#ffffff" name="close-outline" size={24} />
                </Pressable>
              </View>

              {rolesToRender.length > 0 ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{copy.roleSectionTitle}</Text>
                  <View style={styles.sectionBody}>
                    {rolesToRender.map((role) => (
                      <RoleRow
                        icon={getRoleIcon(role)}
                        isActive={activeRole === role}
                        key={role}
                        label={getRoleLabel(language, role)}
                        onPress={() => handleRoleChange(role)}
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              <Pressable onPress={() => navigate("/(settings)/roles")} style={styles.addRoleButton}>
                <Ionicons color="#22c55e" name="add-circle-outline" size={18} />
                <Text style={styles.addRoleLabel}>{copy.addRole}</Text>
              </Pressable>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{copy.settingsSectionTitle}</Text>
                <View style={styles.sectionBody}>
                  <Pressable onPress={() => setIsLanguageSheetOpen(true)} style={styles.menuRow}>
                    <View style={styles.rowLabelWrap}>
                      <Ionicons color="#d8e1ef" name="language-outline" size={18} />
                      <Text style={styles.menuLabel}>{copy.language}</Text>
                    </View>
                    <Text style={styles.trailingValue}>{currentLanguageLabel}</Text>
                  </Pressable>
                  <MenuRow icon="person-circle-outline" label={copy.profileSettings} onPress={() => navigate("/(tabs)/profile")} />
                  <MenuRow icon="notifications-outline" label={copy.notifications} onPress={() => navigate("/(settings)/notifications")} />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{copy.miscSectionTitle}</Text>
                <View style={styles.sectionBody}>
                  <MenuRow icon="log-out-outline" label={copy.logout} onPress={() => void handleLogout()} />
                </View>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerLabel}>{copy.appVersion}</Text>
                <Text style={styles.footerValue}>{VERSION}</Text>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>

      <Modal animationType="fade" onRequestClose={() => setIsLanguageSheetOpen(false)} transparent visible={isLanguageSheetOpen}>
        <View style={styles.sheetOverlay}>
          <Pressable onPress={() => setIsLanguageSheetOpen(false)} style={StyleSheet.absoluteFillObject} />
          <SafeAreaView edges={["bottom"]} style={styles.sheetSafeArea}>
            <View style={styles.sheetCard}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>{copy.languageSheetTitle}</Text>
              <LanguageOption flag="KO" label={copy.languageKo} onPress={handleLanguageChange} selected={language === "ko"} value="ko" />
              <LanguageOption flag="VI" label={copy.languageVi} onPress={handleLanguageChange} selected={language === "vi"} value="vi" />
              <LanguageOption flag="EN" label={copy.languageEn} onPress={handleLanguageChange} selected={language === "en"} value="en" />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(5, 8, 18, 0.42)",
  },
  scrim: { flex: 1 },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: "#161827",
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 4, height: 0 },
    elevation: 12,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  profileRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#2f3345",
  },
  avatarFallback: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2f3345",
  },
  avatarFallbackText: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
  },
  profileCopy: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    color: "#ffffff",
    fontSize: 21,
    fontWeight: "800",
  },
  profileRoleCaption: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    color: "#9aa5b4",
    fontSize: 12,
    fontWeight: "600",
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.16)",
  },
  roleBadgeLabel: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    color: "#86efac",
    fontSize: 12,
    fontWeight: "700",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 12,
    fontWeight: "800",
    color: "#7d8897",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionBody: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  rowLabelWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  roleRowActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  roleRowLabel: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 15,
    fontWeight: "700",
    color: "#dfe7f2",
  },
  roleRowLabelActive: {
    color: "#ffffff",
  },
  addRoleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "rgba(34,197,94,0.1)",
  },
  addRoleLabel: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 14,
    fontWeight: "700",
    color: "#86efac",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  menuLabel: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 15,
    fontWeight: "600",
    color: "#f8fafc",
  },
  trailingValue: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 12,
    fontWeight: "600",
    color: "#b8c2cf",
  },
  footer: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  footerLabel: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 12,
    color: "#7d8897",
  },
  footerValue: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 12,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(5, 8, 18, 0.28)",
  },
  sheetSafeArea: {
    justifyContent: "flex-end",
  },
  sheetCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 10,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 48,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#d1d5db",
    marginBottom: 6,
  },
  sheetTitle: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  languageOptionSelected: {
    borderColor: "#22c55e",
    backgroundColor: "#f0fdf4",
  },
  languageOptionFlag: {
    fontSize: 18,
  },
  languageOptionLabel: {
    ...(APP_FONT_FAMILY ? { fontFamily: APP_FONT_FAMILY } : {}),
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  languageOptionLabelSelected: {
    color: "#166534",
  },
});
