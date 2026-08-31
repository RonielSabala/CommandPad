import { ReplaceSyntax } from "@/common/variableSyntax";
import { replaceOccurrences } from "@/utils/string";

import { defineCallOperation } from "./call";
import type { OperationDefinition } from "./types";

export const REPLACE_OPERATION: OperationDefinition = defineCallOperation({
  arity: ReplaceSyntax.ARITY,
  builders: {
    [ReplaceSyntax.KEYWORD]: (args) => {
      const [needle = "", replacement = ""] = args;
      if (args.length !== ReplaceSyntax.ARITY || !needle) {
        return null;
      }

      return (text) => replaceOccurrences(text, needle, replacement);
    },
  },
});
