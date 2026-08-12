import { SliceSyntax } from "@/common/variableSyntax";
import { sliceString } from "@/utils/string";

import { defineCallOperation } from "./call";
import { readNumberArguments } from "./number";
import type { OperationDefinition } from "./types";

interface SliceSpec {
  start: number | null;
  stop: number | null;
  step: number;
}

function parseSlice(args: readonly string[]): SliceSpec | null {
  const bounds = readNumberArguments(args);
  if (!bounds || bounds.length === 0) {
    return null;
  }

  const [start, stop, step = null] = bounds;

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

  const stepValue = step ?? SliceSyntax.DEFAULT_STEP;
  return stepValue === 0 ? null : { start, stop, step: stepValue };
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
