import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth.store";

type UseAuthResult = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSigningIn: boolean;
  errorMessage: string | null;
  statusMessage: string | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

export function useAuth(): UseAuthResult {
  const incomingUrl = Linking.useURL();
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isSigningIn = useAuthStore((state) => state.isSigningIn);
  const errorMessage = useAuthStore((state) => state.errorMessage);
  const statusMessage = useAuthStore((state) => state.statusMessage);
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signOut = useAuthStore((state) => state.signOut);

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  useEffect(() => {
    void useAuthStore.getState().syncSessionFromUrl(incomingUrl);
  }, [incomingUrl]);

  return {
    session,
    user: session?.user ?? null,
    isAuthenticated: Boolean(session?.user),
    isLoading,
    isSigningIn,
    errorMessage,
    statusMessage,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
}