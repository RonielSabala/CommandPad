import { CountOperationRegex, OperationSyntax } from "@/common/variableSyntax";
import { countCharacters } from "@/utils/string";

import { bareKeywords, type OperationDefinition } from "./types";

export const COUNT_OPERATION: OperationDefinition = {
  keywords: bareKeywords([OperationSyntax.COUNT]),
  parse: (operation) =>
    CountOperationRegex.test(operation.trim())
      ? (text) => String(countCharacters(text))
      : null,
};
