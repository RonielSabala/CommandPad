import { KeyOperationRegex, OperationSyntax } from "@/common/variableSyntax";

import { bareKeywords, type OperationDefinition } from "./types";

export const KEY_OPERATION: OperationDefinition = {
  keywords: bareKeywords([OperationSyntax.KEY]),
  parse: (operation) =>
    KeyOperationRegex.test(operation.trim())
      ? (_text, context) => context.key
      : null,
};
