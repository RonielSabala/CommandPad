import { LogicSyntax } from "@/common/variableSyntax";

import { readBooleans, writeBoolean } from "./boolean";
import { defineCallOperation, type CallBuilder } from "./call";
import type { OperationDefinition } from "./types";

type Combine = (values: boolean[]) => boolean;

function logicBuilder(combine: Combine, exactly?: number): CallBuilder {
  return (args) => {
    if (exactly === undefined ? args.length === 0 : args.length !== exactly) {
      return null;
    }

    const values = readBooleans(args);
    return values && (() => writeBoolean(combine(values)));
  };
}

export const LOGIC_OPERATION: OperationDefinition = defineCallOperation({
  arity: LogicSyntax.ARITY,
  builders: {
    [LogicSyntax.AND]: logicBuilder((values) => values.every(Boolean)),
    [LogicSyntax.OR]: logicBuilder((values) => values.some(Boolean)),
    [LogicSyntax.XOR]: logicBuilder(
      (values) => values.filter(Boolean).length % 2 === 1,
    ),
    [LogicSyntax.NOT]: logicBuilder(([value]) => !value, LogicSyntax.NOT_ARITY),
  },
});
