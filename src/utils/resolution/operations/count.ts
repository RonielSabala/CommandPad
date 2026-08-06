import { CountOperationRegex } from "@/common/variableSyntax";
import { countCharacters } from "@/utils/string";

import type { OperationDefinition } from "./types";

export const COUNT_OPERATION: OperationDefinition = {
  parse: (operation) =>
    CountOperationRegex.test(operation.trim())
      ? (text) => String(countCharacters(text))
      : null,
};
