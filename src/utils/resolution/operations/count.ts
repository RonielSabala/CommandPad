import { CountSyntax } from "@/common/variableSyntax";
import { countOccurrences } from "@/utils/string";

import { defineCallOperation } from "./call";
import type { OperationDefinition } from "./types";

export const COUNT_OPERATION: OperationDefinition = defineCallOperation({
  arity: CountSyntax.ARITY,
  builders: {
    [CountSyntax.KEYWORD]: ([needle = ""]) =>
      needle ? (text) => String(countOccurrences(text, needle)) : null,
  },
});
