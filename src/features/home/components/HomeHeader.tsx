import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { getHomeAssetSource } from "@/features/home/home-assets";
import type { HomeCopy } from "@/features/home/home-copy";
import { useRoleSwitchStore } from "@/store/role-switch.store";

type HomeHeaderProps = {
  notificationCount: number;
  onOpenNotifications: () => void;
  copy: HomeCopy;
};

export function HomeHeader(props: HomeHeaderProps): JSX.Element {
  const { notificationCount, onOpenNotifications, copy } = props;
  const openDrawer = useRoleSwitchStore((state) => state.openDrawer);

  return (
    <View style={styles.row}>
      <Pressable hitSlop={10} onPress={openDrawer} style={styles.iconButton}>
        <Ionicons color="#111827" name="menu-outline" size={24} />
      </Pressable>
      <Image resizeMode="contain" source={getHomeAssetSource("logo")} style={styles.logo} />
      <Pressable hitSlop={10} onPress={onOpenNotifications} style={styles.iconButton}>
        <Ionicons color="#111827" name="notifications-outline" size={22} />
        {notificationCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{notificationCount > 9 ? "9+" : notificationCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 96,
    height: 26,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
});