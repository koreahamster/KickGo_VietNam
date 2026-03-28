import { useEffect, useMemo, useRef } from "react";

import { clearBootstrapCache, loadBootstrapCache, saveBootstrapCache } from "@/core/lib/bootstrap-cache";
import { getBootstrapActiveRole, type BootstrapData } from "@/core/types/bootstrap.types";
import { fetchBootstrap } from "@/services/bootstrap.service";
import { useBootstrapStore } from "@/store/bootstrap.store";
import { useRoleSwitchStore } from "@/store/role-switch.store";

type UseBootstrapOptions = {
  userId: string | null;
  isAuthenticated: boolean;
  isAuthResolved: boolean;
};

function serializeBootstrap(data: BootstrapData | null): string {
  return JSON.stringify(data);
}

export function useBootstrap(options: UseBootstrapOptions): {
  bootstrapData: BootstrapData | null;
  isBootstrapped: boolean;
  activeRole: "player" | "referee" | "facility_manager" | null;
} {
  const { userId, isAuthenticated, isAuthResolved } = options;
  const bootstrapData = useBootstrapStore((state) => state.bootstrapData);
  const isBootstrapped = useBootstrapStore((state) => state.isBootstrapped);
  const setBootstrap = useBootstrapStore((state) => state.setBootstrap);
  const setStale = useBootstrapStore((state) => state.setStale);
  const clearBootstrap = useBootstrapStore((state) => state.clearBootstrap);
  const setAvailableRoles = useRoleSwitchStore((state) => state.setAvailableRoles);
  const clearCacheHandledRef = useRef(false);
  const cachedBootstrapRef = useRef<BootstrapData | null>(null);

  useEffect(() => {
    if (cachedBootstrapRef.current) {
      return;
    }

    const cachedBootstrap = loadBootstrapCache();

    if (cachedBootstrap) {
      cachedBootstrapRef.current = cachedBootstrap;
      setBootstrap(cachedBootstrap);
    }
  }, [setBootstrap]);

  useEffect(() => {
    if (!isAuthResolved || isAuthenticated || userId) {
      clearCacheHandledRef.current = false;
      return;
    }

    if (clearCacheHandledRef.current) {
      return;
    }

    clearBootstrapCache();
    clearBootstrap();
    setAvailableRoles([]);
    clearCacheHandledRef.current = true;
  }, [clearBootstrap, isAuthenticated, isAuthResolved, setAvailableRoles, userId]);

  useEffect(() => {
    if (!userId || !isAuthenticated) {
      return;
    }

    let isMounted = true;

    const syncBootstrap = async (): Promise<void> => {
      const nextBootstrap = await fetchBootstrap();

      if (!isMounted) {
        return;
      }

      if (!nextBootstrap) {
        setStale();
        return;
      }

      const currentValue = useBootstrapStore.getState().bootstrapData;
      const currentSerialized = serializeBootstrap(currentValue);
      const nextSerialized = serializeBootstrap(nextBootstrap);

      if (currentSerialized !== nextSerialized) {
        setBootstrap(nextBootstrap);
        saveBootstrapCache(nextBootstrap);
        return;
      }

      setBootstrap(nextBootstrap);
    };

    void syncBootstrap();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, setBootstrap, setStale, userId]);

  useEffect(() => {
    setAvailableRoles(bootstrapData?.account_types ?? []);
  }, [bootstrapData, setAvailableRoles]);

  const activeRole = useMemo(() => getBootstrapActiveRole(bootstrapData), [bootstrapData]);

  return {
    bootstrapData,
    isBootstrapped,
    activeRole,
  };
}
