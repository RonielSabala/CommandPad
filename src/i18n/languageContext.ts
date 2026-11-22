import { createContext } from "react";
import type { Language } from "./types";

/** The app's language. */
export const LanguageContext = createContext<Language | null>(null);
