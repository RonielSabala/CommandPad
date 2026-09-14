import { InsertSyntax } from "@/common/variableSyntax";
import { insertText } from "@/utils/string";

import { defineCallOperation } from "./call";
import { readNumberArgument } from "./number";
import type { OperationDefinition } from "./types";

export const INSERT_OPERATION: OperationDefinition = defineCallOperation({
  arity: InsertSyntax.ARITY,
  builders: {
    [InsertSyntax.KEYWORD]: ([insertion = "", rawIndex = ""]) => {
      if (!insertion) {
        return null;
      }

      const index = readNumberArgument(rawIndex);
      if (index === undefined || index === null) {
        return null;
      }

      return (text) => insertText(text, insertion, index);
    },
  },
});
