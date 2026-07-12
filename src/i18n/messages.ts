import { en } from "./locales/en";
import { es } from "./locales/es";
import { Language, LANGUAGE_ORDER, type Messages } from "./types";

export const MESSAGES: Record<Language, Messages> = {
  [Language.EN]: en,
  [Language.ES]: es,
};

export function isLanguage(value: unknown): value is Language {
  return (
    typeof value === "string" && LANGUAGE_ORDER.includes(value as Language)
  );
}

export function detectLanguage(): Language {
  const preferred = navigator.language?.toLowerCase() ?? "";
  return (
    LANGUAGE_ORDER.find((language) => preferred.startsWith(language)) ??
    Language.EN
  );
}

export function getMessages(language: Language): Messages {
  return MESSAGES[language];
}
