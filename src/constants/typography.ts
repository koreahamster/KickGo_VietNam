import { Platform, type StyleProp, type TextStyle } from "react-native";

type HeaderTitleStyle = Pick<TextStyle, "fontFamily" | "fontSize" | "fontWeight"> & {
  color?: string;
};

export const APP_FONT_FAMILY = Platform.select({
  ios: "Times New Roman",
  android: "serif",
  default: undefined,
});

export function withAppFont(style?: StyleProp<TextStyle>): StyleProp<TextStyle> {
  if (!APP_FONT_FAMILY) {
    return style;
  }

  if (!style) {
    return { fontFamily: APP_FONT_FAMILY };
  }

  return [{ fontFamily: APP_FONT_FAMILY }, style];
}

export const APP_HEADER_TITLE_STYLE: HeaderTitleStyle = APP_FONT_FAMILY
  ? { fontFamily: APP_FONT_FAMILY }
  : {};

export const APP_TAB_LABEL_STYLE: TextStyle = APP_FONT_FAMILY
  ? { fontFamily: APP_FONT_FAMILY }
  : {};