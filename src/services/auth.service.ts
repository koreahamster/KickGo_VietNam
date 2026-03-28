import type {
  AuthChangeEvent,
  Session,
  Subscription,
} from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";

import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export const AUTH_REDIRECT_URL = "footgo://login";

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

type EmailAuthResult = {
  message: string | null;
  session: Session | null;
};

export type AuthStateChangeCallback = (
  event: AuthChangeEvent,
  session: Session | null
) => void;

function isExpoGo(): boolean {
  return Constants.executionEnvironment === "storeClient";
}

function buildRedirectUrl(): string {
  return AUTH_REDIRECT_URL;
}

export function isAuthCallbackUrl(url: string): boolean {
  return url.startsWith(AUTH_REDIRECT_URL);
}

function assertSupportedOAuthEnvironment(): void {
  if (!isExpoGo()) {
    return;
  }

  throw new Error(
    "Expo Go에서는 Google OAuth 리디렉트를 안정적으로 처리할 수 없습니다. development build에서 다시 실행하고 Supabase Redirect URL에 footgo://login 을 등록하세요. 홈 화면 흐름 검증은 아래 이메일 로그인으로 먼저 진행할 수 있습니다."
  );
}

function parseSessionTokens(url: string): SessionTokens | null {
  const parsedUrl = new URL(url);
  const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ""));

  const accessToken =
    hashParams.get("access_token") ?? parsedUrl.searchParams.get("access_token");
  const refreshToken =
    hashParams.get("refresh_token") ??
    parsedUrl.searchParams.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

export async function recoverSessionFromUrl(url: string): Promise<Session | null> {
  const sessionTokens = parseSessionTokens(url);

  if (!sessionTokens) {
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token: sessionTokens.accessToken,
    refresh_token: sessionTokens.refreshToken,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export async function signInWithGoogle(): Promise<Session | null> {
  assertSupportedOAuthEnvironment();

  const redirectTo = buildRedirectUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.url) {
    throw new Error("Google sign-in URL could not be created.");
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") {
    return null;
  }

  return recoverSessionFromUrl(result.url);
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session) {
    throw new Error("이메일 로그인 세션을 만들 수 없습니다.");
  }

  return data.session;
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<EmailAuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data.user?.identities?.length === 0) {
    throw new Error("이미 가입된 이메일입니다. 로그인으로 진행하세요.");
  }

  if (data.session) {
    return {
      message: null,
      session: data.session,
    };
  }

  return {
    message: "가입이 완료되었습니다. 이메일 인증을 완료한 뒤 로그인해 주세요.",
    session: null,
  };
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export function subscribeToAuthStateChange(
  callback: AuthStateChangeCallback
): Subscription {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return subscription;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

}
