import type { Variable } from "@/common/types";
import type { EmbedSource } from "@/utils/embeddedRunbook";
import { createContext } from "react";

export interface EmbedScope {
  source: EmbedSource;
  variables: Variable[];
}

export const EmbedScopeContext = createContext<EmbedScope | null>(null);
