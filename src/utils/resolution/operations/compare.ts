import { CompareSyntax } from "@/common/variableSyntax";

import { writeBoolean } from "./boolean";
import { defineCallOperation, type CallBuilder } from "./call";
import type { OperationDefinition } from "./types";

type Comparison = (left: string, right: string) => boolean;

function compareBuilder(compare: Comparison): CallBuilder {
  return (args) => {
    if (args.length !== CompareSyntax.ARITY) {
      return null;
    }

    const [left = "", right = ""] = args.map((arg) => arg.trim());
    return () => writeBoolean(compare(left, right));
  };
}

const equals: Comparison = (left, right) => left === right;
const equalsIgnoreCase: Comparison = (left, right) =>
  left.toLowerCase() === right.toLowerCase();

export const COMPARE_OPERATION: OperationDefinition = defineCallOperation({
  arity: CompareSyntax.ARITY,
  builders: {
    [CompareSyntax.EQUALS]: compareBuilder(equals),
    [CompareSyntax.NOT_EQUALS]: compareBuilder(
      (left, right) => !equals(left, right),
    ),
    [CompareSyntax.EQUALS_IGNORE_CASE]: compareBuilder(equalsIgnoreCase),
  },
});
