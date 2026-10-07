import { RoundSyntax } from "@/common/variableSyntax";
import {
  formatArithmetic,
  parseNumber,
  roundToDigits,
} from "@/utils/arithmetic";

import { type CallBuilder, defineCallOperation } from "./call";
import { readNumberArgument } from "./number";
import type { OperationDefinition } from "./types";

function roundHalfAway(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value));
}

function roundingBuilder(round: (value: number) => number): CallBuilder {
  return ([raw = ""]) => {
    const digits = readNumberArgument(raw);
    if (digits === undefined) {
      return null;
    }

    const places = digits ?? RoundSyntax.DEFAULT_DIGITS;
    if (Math.abs(places) > RoundSyntax.MAX_DIGITS) {
      return null;
    }

    return (text) => {
      const value = parseNumber(text);
      return value === undefined
        ? null
        : formatArithmetic(roundToDigits(value, places, round));
    };
  };
}

export const ROUND_OPERATION: OperationDefinition = defineCallOperation({
  arity: RoundSyntax.ARITY,
  builders: {
    [RoundSyntax.ROUND]: roundingBuilder(roundHalfAway),
    [RoundSyntax.FLOOR]: roundingBuilder(Math.floor),
    [RoundSyntax.CEIL]: roundingBuilder(Math.ceil),
  },
});
