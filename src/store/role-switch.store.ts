import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AccountType } from "@/types/profile.types";

export type ActiveRole = AccountType;

const DEFAULT_AVAILABLE_ROLES: ActiveRole[] = ["player", "referee", "facility_manager"];

function sanitizeRoles(roles: ActiveRole[]): ActiveRole[] {
  const valid = roles.filter((role): role is ActiveRole =>
    role === "player" || role === "referee" || role === "facility_manager",
  );

  if (valid.length === 0) {
    return DEFAULT_AVAILABLE_ROLES;
  }

  return Array.from(new Set(valid));
}

type RoleSwitchState = {
  activeRole: ActiveRole;
  availableRoles: ActiveRole[];
  isDrawerOpen: boolean;
  setActiveRole: (role: ActiveRole) => void;
  setAvailableRoles: (roles: ActiveRole[]) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
};

export const useRoleSwitchStore = create<RoleSwitchState>()(
  persist(
    (set) => ({
      activeRole: "player",
      availableRoles: DEFAULT_AVAILABLE_ROLES,
      isDrawerOpen: false,
      setActiveRole: (role) =>
        set((state) => {
          if (!state.availableRoles.includes(role)) {
            return state;
          }

          return { activeRole: role };
        }),
      setAvailableRoles: (roles) =>
        set((state) => {
          const nextRoles = sanitizeRoles(roles);
          const nextActiveRole = nextRoles.includes(state.activeRole) ? state.activeRole : nextRoles[0];

          return {
            availableRoles: nextRoles,
            activeRole: nextActiveRole,
          };
        }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
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
