import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";

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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 인증 오류가 발생했습니다.";
}

export function useAuth(): UseAuthResult {
  const incomingUrl = Linking.useURL();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async (): Promise<void> => {
      try {
        const currentSession = await getCurrentSession();

        if (!isMounted) {
          return;
        }

        setSession(currentSession);
      } catch (error: unknown) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapSession();

    const subscription = subscribeToAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!incomingUrl || !isAuthCallbackUrl(incomingUrl)) {
      return;
    }

    const syncSessionFromUrl = async (): Promise<void> => {
      try {
        const nextSession = await recoverSessionFromUrl(incomingUrl);

        if (nextSession) {
          setSession(nextSession);
          setErrorMessage(null);
          setStatusMessage(null);
        }
      } catch (error: unknown) {
        setErrorMessage(getErrorMessage(error));
      }
    };

    void syncSessionFromUrl();
  }, [incomingUrl]);

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      setIsSigningIn(true);
      setErrorMessage(null);
      setStatusMessage(null);

      const nextSession = await signInWithEmailService(email, password);
      setSession(nextSession);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      setIsSigningIn(true);
      setErrorMessage(null);
      setStatusMessage(null);

      const result = await signUpWithEmailService(email, password);

      if (result.session) {
        setSession(result.session);
      }

      if (result.message) {
        setStatusMessage(result.message);
      }
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setIsSigningIn(true);
      setErrorMessage(null);
      setStatusMessage(null);

      const nextSession = await signInWithGoogleService();

      if (nextSession) {
        setSession(nextSession);
      }
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setErrorMessage(null);
      setStatusMessage(null);
      await signOutService();
      setSession(null);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error));
    }
  };

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
