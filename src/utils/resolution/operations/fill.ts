import { FillSyntax } from "@/common/variableSyntax";
import { fillBoth, fillEnd, fillStart } from "@/utils/string";

import { defineCallOperation, type CallBuilder } from "./call";
import { readNumberArgument } from "./number";
import type { OperationDefinition } from "./types";

function fillEndBuilder(
  fill: (text: string, filler: string, times: number) => string,
): CallBuilder {
  return ([filler = "", rawTimes = ""]) => {
    const times = readNumberArgument(rawTimes);
    if (
      !filler ||
      times === undefined ||
      times === null ||
      times < 0 ||
      times > FillSyntax.MAX_TIMES
    ) {
      return null;
    }

    return (text) => fill(text, filler, times);
  };
}

export const FILL_OPERATION: OperationDefinition = defineCallOperation({
  arity: FillSyntax.ARITY,
  builders: {
    [FillSyntax.BOTH]: fillEndBuilder(fillBoth),
    [FillSyntax.LEFT]: fillEndBuilder(fillStart),
    [FillSyntax.RIGHT]: fillEndBuilder(fillEnd),
  },
});
