import { JustSyntax } from "@/common/variableSyntax";
import { justifyCenter, justifyLeft, justifyRight } from "@/utils/string";

import { defineCallOperation, type CallBuilder } from "./call";
import { readNumberArgument } from "./number";
import type { OperationDefinition } from "./types";

function justBuilder(
  justify: (text: string, fill: string, width: number) => string,
): CallBuilder {
  return ([fill = "", rawWidth = ""]) => {
    const width = readNumberArgument(rawWidth);
    if (
      !fill ||
      width === undefined ||
      width === null ||
      width < 0 ||
      width > JustSyntax.MAX_WIDTH
    ) {
      return null;
    }

    return (text) => justify(text, fill, width);
  };
}

export const JUST_OPERATION: OperationDefinition = defineCallOperation({
  arity: JustSyntax.ARITY,
  builders: {
    [JustSyntax.CENTER]: justBuilder(justifyCenter),
    [JustSyntax.LEFT]: justBuilder(justifyLeft),
    [JustSyntax.RIGHT]: justBuilder(justifyRight),
  },
});
