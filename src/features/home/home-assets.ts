import type { ImageSourcePropType } from "react-native";

import type { HomeAssetKey } from "@/types/home.types";

const HOME_ASSETS: Record<HomeAssetKey, ImageSourcePropType> = {
  main: require("../../assets/images/main.png"),
  logo: require("../../assets/images/logo.png"),
};

export function getHomeAssetSource(key: HomeAssetKey): ImageSourcePropType {
  return HOME_ASSETS[key];
}