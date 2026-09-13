import { IndexSyntax } from "@/common/variableSyntax";
import { indexOfText } from "@/utils/string";

import { defineCallOperation } from "./call";
import type { OperationDefinition } from "./types";

export const INDEX_OPERATION: OperationDefinition = defineCallOperation({
  arity: IndexSyntax.ARITY,
  builders: {
    [IndexSyntax.KEYWORD]: ([needle = ""]) =>
      needle ? (text) => String(indexOfText(text, needle)) : null,
  },
});
