import type { ResolvedSpan } from "@/common/types";

export interface ResolvedValue {
  text: string;
  spans: ResolvedSpan[];
}

export type VariableMap = Record<string, ResolvedValue>;
export type VariableLookup = (key: string) => ResolvedValue | undefined;
