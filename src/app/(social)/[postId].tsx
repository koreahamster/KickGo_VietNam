import { RoutePlaceholder } from "@/shared/components/RoutePlaceholder";

export default function PlaceholderScreen(): JSX.Element {
  return <RoutePlaceholder title="Post Detail" route="/(social)/[postId]" />;
}