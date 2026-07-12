import { useStore } from "@/store/store";
import { MESSAGES } from "./messages";
import type { Messages } from "./types";

export function useTranslation(): Messages {
  return useStore((state) => MESSAGES[state.language]);
}
