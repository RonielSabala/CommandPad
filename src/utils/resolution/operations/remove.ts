import { RemoveSyntax } from "@/common/variableSyntax";
import { replaceOccurrences } from "@/utils/string";

import { defineCallOperation } from "./call";
import type { OperationDefinition } from "./types";

export const REMOVE_OPERATION: OperationDefinition = defineCallOperation({
  arity: RemoveSyntax.ARITY,
  builders: {
    [RemoveSyntax.KEYWORD]: ([needle = ""]) =>
      needle ? (text) => replaceOccurrences(text, needle, "") : null,
  },
});
