import {
  SliceBoundRegex,
  SliceSyntax,
  TokenWhitespaceRegex,
} from "@/common/variableSyntax";
import { sliceString } from "@/utils/string";

import { defineCallOperation } from "./call";
import type { OperationDefinition } from "./types";

interface SliceSpec {
  start: number | null;
  stop: number | null;
  step: number;
}

function parseSliceBound(raw: string): number | null {
  return raw ? Number(raw) : null;
}

function parseSlice(args: readonly string[]): SliceSpec | null {
  const bounds = args.map((arg) => arg.replace(TokenWhitespaceRegex, ""));
  if (
    bounds.length === 0 ||
    !bounds.every((bound) => SliceBoundRegex.test(bound))
  ) {
    return null;
  }

  const [rawStart, rawStop, rawStep] = bounds;
  const start = parseSliceBound(rawStart);

  // A lone argument is a single index, not a range
  if (bounds.length === 1) {
    return start === null
      ? null
      : {
          start,
          stop: start === -1 ? null : start + 1,
          step: SliceSyntax.DEFAULT_STEP,
        };
  }

  const step = rawStep ? Number(rawStep) : SliceSyntax.DEFAULT_STEP;
  if (step === 0) {
    return null;
  }

  return { start, stop: parseSliceBound(rawStop), step };
}

export const SLICE_OPERATION: OperationDefinition = defineCallOperation({
  arity: SliceSyntax.ARITY,
  builders: {
    [SliceSyntax.KEYWORD]: (args) => {
      const spec = parseSlice(args);

      return (
        spec && ((text) => sliceString(text, spec.start, spec.stop, spec.step))
      );
    },
  },
});
