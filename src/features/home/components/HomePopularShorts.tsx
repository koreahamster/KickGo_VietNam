import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getHomeAssetSource } from "@/features/home/home-assets";
import { HomeSectionHeader } from "@/features/home/components/HomeSectionHeader";
import { HomeInlineError, HomeSectionSkeleton } from "@/features/home/components/HomeSectionSkeleton";
import type { HomeCopy } from "@/features/home/home-copy";
import { formatViews } from "@/features/home/home-utils";
import { usePopularShorts } from "@/hooks/home/usePopularShorts";
import type { SupportedLanguage } from "@/types/profile.types";

type HomePopularShortsProps = {
  language: SupportedLanguage;
  copy: HomeCopy;
};

export function HomePopularShorts(props: HomePopularShortsProps): JSX.Element | null {
  const { language, copy } = props;
  const shortsQuery = usePopularShorts();

  if (shortsQuery.isLoading) {
    return (
      <View style={styles.section}>
        <HomeSectionHeader actionLabel={copy.seeMore} onPress={() => router.push("/(tabs)/social")} title={copy.popularShorts} />
        <HomeSectionSkeleton height={112} />
      </View>
    );
  }

  if (shortsQuery.isError) {
    return (
      <View style={styles.section}>
        <HomeSectionHeader actionLabel={copy.seeMore} onPress={() => router.push("/(tabs)/social")} title={copy.popularShorts} />
        <View style={styles.errorWrap}>
          <HomeInlineError />
          <Pressable onPress={() => void shortsQuery.refetch()} style={styles.retryButton}>
            <Text style={styles.retryLabel}>{copy.retrySection}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const items = shortsQuery.data ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <HomeSectionHeader actionLabel={copy.seeMore} onPress={() => router.push("/(tabs)/social")} title={copy.popularShorts} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.row}>
          {items.slice(0, 3).map((item) => (
            <Pressable key={item.id} onPress={() => router.push("/(tabs)/social")} style={styles.card}>
              <ImageBackground
                imageStyle={styles.image}
                resizeMode="cover"
                source={item.image_url ? { uri: item.image_url } : getHomeAssetSource(item.fallback_asset ?? "main")}
                style={styles.imageWrap}
              >
                <View style={styles.overlay}>
                  <Ionicons color="#ffffff" name="play-circle" size={28} />
                  <View style={styles.viewsPill}>
                    <Text style={styles.viewsLabel}>{formatViews(item.views, language)}</Text>
                  </View>
                </View>
              </ImageBackground>
              <Text numberOfLines={2} style={styles.title}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 20,
  },
  card: {
    width: 124,
    gap: 8,
  },
  imageWrap: {
    width: 124,
    height: 124,
    justifyContent: "flex-end",
  },
  image: {
    borderRadius: 18,
  },
  overlay: {
    flex: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.18)",
  },
  viewsPill: {
    position: "absolute",
    right: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(17,24,39,0.58)",
  },
  viewsLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  title: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#111827",
  },
  errorWrap: {
    gap: 10,
  },
  retryButton: {
    alignSelf: "flex-start",
  },
  retryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
});