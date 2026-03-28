import type { Session, Subscription } from "@supabase/supabase-js";
import { create } from "zustand";

import {
  getCurrentSession,
  isAuthCallbackUrl,
  recoverSessionFromUrl,
  signInWithEmail as signInWithEmailService,
  signInWithGoogle as signInWithGoogleService,
  signOut as signOutService,
  signUpWithEmail as signUpWithEmailService,
  subscribeToAuthStateChange,
} from "@/services/auth.service";

type AuthStoreState = {
  session: Session | null;
  isLoading: boolean;
  isSigningIn: boolean;
  errorMessage: string | null;
  statusMessage: string | null;
  initialize: () => void;
  syncSessionFromUrl: (url: string | null) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

let hasInitializedAuthStore = false;
let authSubscription: Subscription | null = null;
let lastHandledAuthUrl: string | null = null;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown authentication error occurred.";
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  session: null,
  isLoading: true,
  isSigningIn: false,
  errorMessage: null,
  statusMessage: null,
  initialize: () => {
    if (hasInitializedAuthStore) {
      return;
    }

    hasInitializedAuthStore = true;
    set({ isLoading: true });

    void getCurrentSession()
      .then((session) => {
        set({ session, errorMessage: null });
      })
      .catch((error: unknown) => {
        set({ errorMessage: getErrorMessage(error) });
      })
      .finally(() => {
        set({ isLoading: false });
      });

    authSubscription = subscribeToAuthStateChange((_event, nextSession) => {
      set({
        session: nextSession,
        isLoading: false,
      });
    });
  },
  syncSessionFromUrl: async (url) => {
    if (!url || !isAuthCallbackUrl(url) || lastHandledAuthUrl === url) {
      return;
    }

    lastHandledAuthUrl = url;

    try {
      const nextSession = await recoverSessionFromUrl(url);

      if (nextSession) {
        set({
          session: nextSession,
          errorMessage: null,
          statusMessage: null,
        });
      }
    } catch (error: unknown) {
      set({ errorMessage: getErrorMessage(error) });
    }
  },
  signInWithEmail: async (email, password) => {
    try {
      set({
        isSigningIn: true,
        errorMessage: null,
        statusMessage: null,
      });

      const nextSession = await signInWithEmailService(email, password);
      set({ session: nextSession });
    } catch (error: unknown) {
      set({ errorMessage: getErrorMessage(error) });
    } finally {
      set({ isSigningIn: false });
    }
  },
  signUpWithEmail: async (email, password) => {
    try {
      set({
        isSigningIn: true,
        errorMessage: null,
        statusMessage: null,
      });

      const result = await signUpWithEmailService(email, password);

      set({
        session: result.session,
        statusMessage: result.message,
      });
    } catch (error: unknown) {
      set({ errorMessage: getErrorMessage(error) });
    } finally {
      set({ isSigningIn: false });
    }
  },
  signInWithGoogle: async () => {
    try {
      set({
        isSigningIn: true,
        errorMessage: null,
        statusMessage: null,
      });

      const nextSession = await signInWithGoogleService();

      if (nextSession) {
        set({ session: nextSession });
      }
    } catch (error: unknown) {
      set({ errorMessage: getErrorMessage(error) });
    } finally {
      set({ isSigningIn: false });
    }
  },
  signOut: async () => {
    try {
      set({ errorMessage: null, statusMessage: null });
      await signOutService();
      set({ session: null });
    } catch (error: unknown) {
      set({ errorMessage: getErrorMessage(error) });
    }
  },
}));

export function disposeAuthStoreSubscription(): void {
  authSubscription?.unsubscribe();
  authSubscription = null;
  hasInitializedAuthStore = false;
}