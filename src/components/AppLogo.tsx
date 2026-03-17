import { StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/colors";

export function AppLogo(): JSX.Element {
  return (
    <View style={styles.logo}>
      <Text style={styles.logoText}>FG</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.brand,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.brandOn,
  },
});
