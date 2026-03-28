import { supabase } from "@/lib/supabase";

import { coerceBootstrapData, type BootstrapData } from "@/core/types/bootstrap.types";

export async function fetchBootstrap(): Promise<BootstrapData | null> {
  try {
    const { data, error } = await supabase.rpc("get_my_bootstrap");

    if (error) {
      console.log("[bootstrap] fetch error", error.message);
      return null;
    }

    return coerceBootstrapData(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown bootstrap error.";
    console.log("[bootstrap] fetch error", message);
    return null;
  }
}
