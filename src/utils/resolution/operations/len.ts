import { LenOperationRegex, OperationSyntax } from "@/common/variableSyntax";
import { countCharacters } from "@/utils/string";

import { bareKeywords, type OperationDefinition } from "./types";

export const LEN_OPERATION: OperationDefinition = {
  keywords: bareKeywords([OperationSyntax.LEN]),
  parse: (operation) =>
    LenOperationRegex.test(operation.text.trim())
      ? (text) => String(countCharacters(text))
      : null,
};
