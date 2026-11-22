import type {
  CompletionSource,
  VariableCompletion,
} from "@/monaco/completions";
import { createContext } from "react";

export const NO_COMPLETIONS: VariableCompletion[] = [];

/** The list's completions, listed only as a suggestion opens. */
export const CompletionsContext =
  createContext<CompletionSource>(NO_COMPLETIONS);
