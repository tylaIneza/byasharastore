"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { translations, Language } from "@/lib/translations";

type Translation = (typeof translations)[Language];

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      language: "en",
      t: translations["en"],
      setLanguage: (language) => set({ language, t: translations[language] }),
    }),
    {
      name: "byashara-language",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
