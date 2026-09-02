import type { ResolvedSpan } from "@/common/types";

/** What an operation knows about the reference it is running inside. */
export interface OperationContext {
  /** The key of the variable being resolved. */
  key: string;
}

/** One operation as written, with its own references already resolved. */
export interface OperationChunk {
  text: string;
  /** The spans describing `text`. */
  spans?: readonly ResolvedSpan[];
}

export type OperationOutput = string | { text: string; spans: ResolvedSpan[] };

export type OperationTransform = (
  text: string,
  context: OperationContext,
) => OperationOutput;

export interface OperationKeyword {
  keyword: string;
  arity: number;
}

export interface OperationDefinition {
  keywords: readonly OperationKeyword[];
  parse: (operation: OperationChunk) => OperationTransform | null;
}

/** Keywords that take no arguments. */
export function bareKeywords(
  keywords: readonly string[],
): readonly OperationKeyword[] {
  return keywords.map((keyword) => ({ keyword, arity: 0 }));
}
