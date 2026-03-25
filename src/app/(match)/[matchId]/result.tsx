import { RoutePlaceholder } from "@/shared/components/RoutePlaceholder";

export default function PlaceholderScreen(): JSX.Element {
  return <RoutePlaceholder title="Match Result" route="/(match)/[matchId]/result" />;
}