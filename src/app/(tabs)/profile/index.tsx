import FacilityManagerProfile from "@/components/profile/FacilityManagerProfile";
import PlayerProfile from "@/components/profile/PlayerProfile";
import RefereeProfile from "@/components/profile/RefereeProfile";
import { useRoleStore } from "@/store/role-switch.store";

export default function ProfileTabScreen(): JSX.Element {
  const activeRole = useRoleStore((state) => state.activeRole);

  if (activeRole === "facility_manager") {
    return <FacilityManagerProfile />;
  }

  if (activeRole === "referee") {
    return <RefereeProfile />;
  }

  return <PlayerProfile />;
}
