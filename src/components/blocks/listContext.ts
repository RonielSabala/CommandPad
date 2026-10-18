import type { VariableCompletion } from "@/monaco/completions";
import { createContext } from "react";

const NO_COMPLETIONS: VariableCompletion[] = [];

export const CompletionsContext =
  createContext<VariableCompletion[]>(NO_COMPLETIONS);
