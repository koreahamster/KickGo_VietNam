import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Session } from "@supabase/supabase-js";
import { router } from "expo-router";
import { useEffect } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { supabase } from "@/lib/supabase";

const SESSION_STARTED_AT_KEY = "@kickgo/session-started-at";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

async function saveSessionStartedAt(timestamp: number): Promise<void> {
  await AsyncStorage.setItem(SESSION_STARTED_AT_KEY, String(timestamp));
}

async function clearSessionStartedAt(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_STARTED_AT_KEY);
}

async function getSessionStartedAt(): Promise<number | null> {
  const value = await AsyncStorage.getItem(SESSION_STARTED_AT_KEY);

  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

async function ensureSessionTimestamp(session: Session | null): Promise<void> {
  if (!session) {
    await clearSessionStartedAt();
    return;
  }

  const startedAt = await getSessionStartedAt();

  if (startedAt !== null) {
    return;
  }

  await saveSessionStartedAt(Date.now());
}

async function checkSessionTimeout(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    await clearSessionStartedAt();
    return;
  }

  await ensureSessionTimestamp(session);
  const startedAt = await getSessionStartedAt();

  if (startedAt === null) {
    return;
  }

  if (Date.now() - startedAt < SESSION_TIMEOUT_MS) {
    return;
  }

  await supabase.auth.signOut();
  await clearSessionStartedAt();
  console.log("[auth] session timeout sign-out");
  router.replace("/");
}

export function SessionTimeoutGate(): null {
  useEffect(() => {
    void checkSessionTimeout();

    const subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        await clearSessionStartedAt();
        return;
      }

      if (event === "SIGNED_IN") {
        await saveSessionStartedAt(Date.now());
        return;
      }

      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") {
        await ensureSessionTimestamp(session);
      }
    });

    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (nextState === "active") {
          void checkSessionTimeout();
        }
      },
    );

    const intervalId = setInterval(() => {
      void checkSessionTimeout();
    }, 60 * 1000);

    return () => {
      subscription.data.subscription.unsubscribe();
      appStateSubscription.remove();
      clearInterval(intervalId);
    };
  }, []);

  return null;
}