/** What an operation knows about the reference it is running inside. */
export interface OperationContext {
  /** The key of the variable being resolved. */
  key: string;
}

export type OperationTransform = (
  text: string,
  context: OperationContext,
) => string;

export interface OperationKeyword {
  keyword: string;
  arity: number;
}

export interface OperationDefinition {
  keywords: readonly OperationKeyword[];
  parse: (operation: string) => OperationTransform | null;
}

/** Keywords that take no arguments. */
export function bareKeywords(
  keywords: readonly string[],
): readonly OperationKeyword[] {
  return keywords.map((keyword) => ({ keyword, arity: 0 }));
}
