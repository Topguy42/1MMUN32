import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import i18n from "@/setup/i18n";

export interface LanguageStore {
  language: string;
  setLanguage(v: string): void;
}

export const useLanguageStore = create(
  persist(
    immer<LanguageStore>((set) => ({
      language: "en",
      setLanguage(_v) {
        set((s) => {
          s.language = "en";
        });
      },
    })),
    { name: "__MW::locale" },
  ),
);

export function changeAppLanguage(_language: string) {
  i18n.changeLanguage("en");
}

export function isRightToLeft(_language: string) {
  return false;
}

export function LanguageProvider() {
  const language = useLanguageStore((s) => s.language);

  useEffect(() => {
    if (language !== "en") useLanguageStore.getState().setLanguage("en");
    changeAppLanguage("en");
  }, [language]);

  const isRtl = isRightToLeft(language);

  return (
    <Helmet>
      <html dir={isRtl ? "rtl" : "ltr"} />
    </Helmet>
  );
}
