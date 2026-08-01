import { sliceString } from "@/utils/string";

import { parseSliceOperation } from "./slice";

interface AppliedOperations {
  text: string;
  ok: boolean;
}

/** Runs a token's operations left to right. */
export function applyOperations(
  text: string,
  operations: string[],
): AppliedOperations {
  let result = text;

  for (const operation of operations) {
    const slice = parseSliceOperation(operation);
    if (!slice) {
      return { text, ok: false };
    }

    result = sliceString(result, slice.start, slice.stop, slice.step);
  }

  return { text: result, ok: true };
}
