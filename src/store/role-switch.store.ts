import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AccountType } from "@/types/profile.types";

export type ActiveRole = AccountType | null;

function sanitizeRoles(roles: AccountType[]): AccountType[] {
  const valid = roles.filter((role): role is AccountType =>
    role === "player" || role === "referee" || role === "facility_manager",
  );

  return Array.from(new Set(valid));
}

type RoleSwitchState = {
  activeRole: ActiveRole;
  availableRoles: AccountType[];
  setActiveRole: (role: ActiveRole) => void;
  setAvailableRoles: (roles: AccountType[]) => void;
};

export const useRoleSwitchStore = create<RoleSwitchState>()(
  persist(
    (set) => ({
      activeRole: null,
      availableRoles: [],
      setActiveRole: (role) =>
        set((state) => {
          if (role === null) {
            return { activeRole: null };
          }

          if (!state.availableRoles.includes(role)) {
            return state;
          }

          return { activeRole: role };
        }),
      setAvailableRoles: (roles) =>
        set((state) => {
          const nextRoles = sanitizeRoles(roles);
          const nextActiveRole = state.activeRole && nextRoles.includes(state.activeRole)
            ? state.activeRole
            : nextRoles[0] ?? null;

          return {
            availableRoles: nextRoles,
            activeRole: nextActiveRole,
          };
        }),
    }),
    {
      name: "@kickgo/active-role",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeRole: state.activeRole,
        availableRoles: state.availableRoles,
      }),
    },
  ),
);

export const useRoleStore = useRoleSwitchStore;
