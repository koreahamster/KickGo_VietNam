import { RoutePlaceholder } from "@/shared/components/RoutePlaceholder";

export default function PlaceholderScreen(): JSX.Element {
  return <RoutePlaceholder title="Referee Match Control" route="/(referee)/match/[matchId]" />;
}