import { useContext } from "react";
import { LanguageContext } from "./languageContext";
import { MESSAGES } from "./messages";
import type { Language, Messages } from "./types";

export function useLanguage(): Language {
  const language = useContext(LanguageContext);
  if (language === null) {
    throw new Error("useLanguage needs a LanguageProvider above it");
  }

  return language;
}

export function useTranslation(): Messages {
  return MESSAGES[useLanguage()];
}
