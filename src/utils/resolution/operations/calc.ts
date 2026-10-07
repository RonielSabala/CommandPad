import { CalcSyntax } from "@/common/variableSyntax";
import { evaluateArithmetic, formatArithmetic } from "@/utils/arithmetic";

import { defineCallOperation } from "./call";
import type { OperationDefinition } from "./types";

export const CALC_OPERATION: OperationDefinition = defineCallOperation({
  arity: CalcSyntax.ARITY,
  builders: {
    [CalcSyntax.KEYWORD]: ([expression = ""]) => {
      const value = evaluateArithmetic(expression);
      if (value === undefined) {
        return null;
      }

      const result = formatArithmetic(value);
      return () => result;
    },
  },
});
