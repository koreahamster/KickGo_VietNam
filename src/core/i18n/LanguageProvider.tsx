import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { detectPreferredLanguage } from "@/lib/device-language";
import type { SupportedLanguage } from "@/types/profile.types";

import { translate } from "./translations";

type LanguageContextValue = {
  language: SupportedLanguage;
  isReady: boolean;
  setLanguage: (language: SupportedLanguage) => Promise<void>;
  t: (key: string) => string;
};

const STORAGE_KEY = "@kickgo/local-language";
const LanguageContext = createContext<LanguageContextValue | null>(null);

async function loadStoredLanguage(): Promise<SupportedLanguage | null> {
  const storedValue = await AsyncStorage.getItem(STORAGE_KEY);

  if (storedValue === "ko" || storedValue === "vi" || storedValue === "en") {
    return storedValue;
  }

  return null;
}

export function LanguageProvider(props: { children: React.ReactNode }): JSX.Element {
  const { children } = props;
  const [language, setLanguageState] = useState<SupportedLanguage>(detectPreferredLanguage());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async (): Promise<void> => {
      try {
        const storedLanguage = await loadStoredLanguage();

        if (!isMounted) {
          return;
        }

        if (storedLanguage) {
          setLanguageState(storedLanguage);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const setLanguage = async (nextLanguage: SupportedLanguage): Promise<void> => {
    setLanguageState(nextLanguage);
    await AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isReady,
      setLanguage,
      t: (key: string) => translate(language, key),
    }),
    [isReady, language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useI18n must be used within LanguageProvider.");
  }

  return context;
}