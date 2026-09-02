import { IfSyntax } from "@/common/variableSyntax";

import { trimSpans } from "../spans";
import { readBoolean } from "./boolean";
import { defineCallOperation } from "./call";
import type { OperationDefinition } from "./types";

const IF_MIN_ARITY = 2;
const THEN_INDEX = 1;
const OTHERWISE_INDEX = 2;

export const IF_OPERATION: OperationDefinition = defineCallOperation({
  arity: IfSyntax.ARITY,
  builders: {
    [IfSyntax.KEYWORD]: (args, argumentSpans) => {
      const [condition = "", then = "", otherwise = ""] = args;
      const value =
        args.length < IF_MIN_ARITY ? undefined : readBoolean(condition);

      if (value === undefined) {
        return null;
      }

      const branch = (value ? then : otherwise).trim();
      const spans = trimSpans(
        argumentSpans(value ? THEN_INDEX : OTHERWISE_INDEX),
      );

      return () => ({ text: branch, spans });
    },
  },
});
