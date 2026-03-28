import { ActivityIndicator, StyleSheet, View } from "react-native";

import { COLORS } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { useBootstrap } from "@/hooks/useBootstrap";

export function BootstrapInitializer(props: { children: React.ReactNode }): JSX.Element {
  const { children } = props;
  const auth = useAuth();
  const { bootstrapData, isBootstrapped } = useBootstrap({
    userId: auth.user?.id ?? null,
    isAuthenticated: auth.isAuthenticated,
    isAuthResolved: !auth.isLoading,
  });

  const hasCachedBootstrap = bootstrapData !== null;
  const shouldBlock = auth.isLoading || (auth.isAuthenticated && !isBootstrapped && !hasCachedBootstrap);

  if (shouldBlock) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={COLORS.brand} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
});
