import Constants from "expo-constants";

import { coerceBootstrapData, type BootstrapData } from "@/core/types/bootstrap.types";

type MMKVModule = typeof import("react-native-mmkv");
type MMKVStorage = ReturnType<MMKVModule["createMMKV"]>;

const BOOTSTRAP_CACHE_KEY = "kickgo_bootstrap_v1";
const MMKV_INSTANCE_ID = "kickgo-bootstrap-cache";

let storageInstance: MMKVStorage | null | undefined;

function canUseMMKV(): boolean {
  return Constants.executionEnvironment !== "storeClient";
}

function getStorage(): MMKVStorage | null {
  if (storageInstance !== undefined) {
    return storageInstance;
  }

  if (!canUseMMKV()) {
    storageInstance = null;
    return storageInstance;
  }

  try {
    const { createMMKV } = require("react-native-mmkv") as MMKVModule;
    storageInstance = createMMKV({ id: MMKV_INSTANCE_ID });
    return storageInstance;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "MMKV initialization failed.";
    console.log("[bootstrap-cache] storage unavailable", message);
    storageInstance = null;
    return storageInstance;
  }
}

export function saveBootstrapCache(data: BootstrapData): void {
  try {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    storage.set(BOOTSTRAP_CACHE_KEY, JSON.stringify(data));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bootstrap cache save failed.";
    console.log("[bootstrap-cache] save error", message);
  }
}

export function loadBootstrapCache(): BootstrapData | null {
  try {
    const storage = getStorage();

    if (!storage) {
      return null;
    }

    const rawValue = storage.getString(BOOTSTRAP_CACHE_KEY);

    if (!rawValue) {
      return null;
    }

    return coerceBootstrapData(JSON.parse(rawValue));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bootstrap cache load failed.";
    console.log("[bootstrap-cache] load error", message);
    return null;
  }
}

export function clearBootstrapCache(): void {
  try {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    storage.remove(BOOTSTRAP_CACHE_KEY);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bootstrap cache clear failed.";
    console.log("[bootstrap-cache] clear error", message);
  }
}
