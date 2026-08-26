import { IfSyntax } from "@/common/variableSyntax";

import { readBoolean } from "./boolean";
import { defineCallOperation } from "./call";
import type { OperationDefinition } from "./types";

const IF_MIN_ARITY = 2;

export const IF_OPERATION: OperationDefinition = defineCallOperation({
  arity: IfSyntax.ARITY,
  builders: {
    [IfSyntax.KEYWORD]: (args) => {
      const [condition = "", then = "", otherwise = ""] = args;
      const value =
        args.length < IF_MIN_ARITY ? undefined : readBoolean(condition);

      if (value === undefined) {
        return null;
      }

      const branch = (value ? then : otherwise).trim();
      return () => branch;
    },
  },
});
