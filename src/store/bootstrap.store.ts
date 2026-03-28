import { create } from "zustand";

import type { BootstrapData } from "@/core/types/bootstrap.types";

type BootstrapState = {
  bootstrapData: BootstrapData | null;
  isBootstrapped: boolean;
  isStale: boolean;
  setBootstrap: (data: BootstrapData) => void;
  setStale: () => void;
  clearBootstrap: () => void;
};

export const useBootstrapStore = create<BootstrapState>((set) => ({
  bootstrapData: null,
  isBootstrapped: false,
  isStale: false,
  setBootstrap: (data) =>
    set({
      bootstrapData: data,
      isBootstrapped: true,
      isStale: false,
    }),
  setStale: () =>
    set((state) => ({
      bootstrapData: state.bootstrapData,
      isBootstrapped: true,
      isStale: true,
    })),
  clearBootstrap: () =>
    set({
      bootstrapData: null,
      isBootstrapped: false,
      isStale: false,
    }),
}));
