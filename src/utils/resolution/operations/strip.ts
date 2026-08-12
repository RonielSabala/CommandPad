import { StripSyntax } from "@/common/variableSyntax";
import { stripBoth, stripEnd, stripStart } from "@/utils/string";

import { defineCallOperation, type CallBuilder } from "./call";
import type { OperationDefinition } from "./types";

/** Cuts the argument off one end, or trims that end's whitespace without one. */
function stripEndBuilder(
  trim: (text: string) => string,
  cut: (text: string, cut: string) => string,
): CallBuilder {
  return ([argument = ""]) =>
    argument ? (text) => cut(text, argument) : (text) => trim(text);
}

export const STRIP_OPERATION: OperationDefinition = defineCallOperation({
  arity: StripSyntax.ARITY,
  builders: {
    [StripSyntax.BOTH]: stripEndBuilder((text) => text.trim(), stripBoth),
    [StripSyntax.LEFT]: stripEndBuilder((text) => text.trimStart(), stripStart),
    [StripSyntax.RIGHT]: stripEndBuilder((text) => text.trimEnd(), stripEnd),
  },
});
