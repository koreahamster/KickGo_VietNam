import { StyleSheet, View } from "react-native";

type HomeSectionSkeletonProps = {
  height?: number;
  count?: number;
};

export function HomeSectionSkeleton(props: HomeSectionSkeletonProps): JSX.Element {
  const { height = 120, count = 1 } = props;

  return (
    <View style={styles.wrap}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.block, { height }]} />
      ))}
    </View>
  );
}

export function HomeInlineError(): JSX.Element {
  return <View style={styles.error} />;
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  block: {
    borderRadius: 16,
    backgroundColor: "#eef2f7",
  },
  error: {
    height: 84,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
});