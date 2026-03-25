import { RoutePlaceholder } from "@/shared/components/RoutePlaceholder";

export default function PlaceholderScreen(): JSX.Element {
  return <RoutePlaceholder title="Team Edit" route="/(team)/[teamId]/edit" />;
}