import { useStore } from "@/store/store";
import { MESSAGES } from "./messages";
import type { Language, Messages } from "./types";

export function useLanguage(): Language {
  return useStore((state) => state.language);
}

export function useTranslation(): Messages {
  return useStore((state) => MESSAGES[state.language]);
}
