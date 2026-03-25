import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ImageBackground, Linking, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";

import { getHomeAssetSource } from "@/features/home/home-assets";
import { useBanners } from "@/hooks/home/useBanners";
import type { HomeCopy } from "@/features/home/home-copy";
import { HomeSectionSkeleton } from "@/features/home/components/HomeSectionSkeleton";

const BANNER_HEIGHT = 180;

type HomeBannerSliderProps = {
  copy: HomeCopy;
};

export function HomeBannerSlider(props: HomeBannerSliderProps): JSX.Element {
  const { copy } = props;
  const bannerQuery = useBanners();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const banners = bannerQuery.data ?? [];

  useEffect(() => {
    if (banners.length < 2) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentIndex((previous) => {
        const next = (previous + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [banners.length, width]);

  if (bannerQuery.isLoading) {
    return <HomeSectionSkeleton height={BANNER_HEIGHT} />;
  }

  if (banners.length === 0) {
    return <View />;
  }

  const handlePress = async (type: string, targetUrl: string | null): Promise<void> => {
    if (type === "external" && targetUrl) {
      await Linking.openURL(targetUrl);
      return;
    }

    if (type === "event") {
      router.push("/(league)/promotion");
      return;
    }

    if (targetUrl?.startsWith("/")) {
      router.push(targetUrl as never);
      return;
    }

    router.push("/notifications");
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      >
        {banners.map((banner) => (
          <Pressable key={banner.id} onPress={() => void handlePress(banner.type, banner.target_url)}>
            <ImageBackground
              imageStyle={styles.image}
              resizeMode="cover"
              source={banner.image_url ? { uri: banner.image_url } : getHomeAssetSource(banner.fallback_asset ?? "main")}
              style={[styles.banner, { width }]}
            >
              <View style={styles.overlay}>
                <View style={styles.copyWrap}>
                  <Text style={styles.title}>{banner.title}</Text>
                  {banner.subtitle ? <Text style={styles.subtitle}>{banner.subtitle}</Text> : null}
                </View>
                <View style={styles.indicatorWrap}>
                  <Text style={styles.indicatorLabel}>{`${currentIndex + 1} / ${banners.length}`}</Text>
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  banner: {
    height: BANNER_HEIGHT,
    justifyContent: "flex-end",
  },
  image: {
    borderRadius: 0,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "rgba(15, 23, 42, 0.28)",
  },
  copyWrap: {
    marginTop: 18,
    maxWidth: "72%",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "rgba(255,255,255,0.92)",
  },
  indicatorWrap: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(17, 24, 39, 0.45)",
  },
  indicatorLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
});