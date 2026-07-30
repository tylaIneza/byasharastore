"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { translations, Language } from "@/lib/translations";

type T = typeof translations["en"];

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: T;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "en",
      t: translations["en"],
      setLanguage: (language) => set({ language, t: translations[language] as unknown as T }),
    }),
    {
      name: "newgen-language",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
