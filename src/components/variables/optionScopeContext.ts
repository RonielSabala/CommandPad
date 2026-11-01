import type { VariableMap } from "@/utils/resolution";
import { createContext } from "react";

interface OptionScope {
  variableMaps: readonly VariableMap[];
  secretKeys: ReadonlySet<string>;
}

export const OptionScopeContext = createContext<OptionScope | null>(null);
