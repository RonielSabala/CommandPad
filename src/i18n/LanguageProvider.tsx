import { useStore } from "@/store/store";
import type { ReactNode } from "react";
import { LanguageContext } from "./languageContext";

/** Subscribes to the language once for the whole app. */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useStore((state) => state.language);

  return (
    <LanguageContext.Provider value={language}>
      {children}
    </LanguageContext.Provider>
  );
}
