import {
  SliceSyntax,
  TokenWhitespaceRegex,
  VariableSliceRegex,
} from "@/common/variableSyntax";

interface SliceSpec {
  start: number | null;
  stop: number | null;
  step: number;
}

function parseSliceBound(raw: string): number | null {
  return raw ? Number(raw) : null;
}

export function parseSliceOperation(operation: string): SliceSpec | null {
  const match = VariableSliceRegex.exec(
    operation.replace(TokenWhitespaceRegex, ""),
  );

  if (!match) {
    return null;
  }

  const [, rawStart, rawStop, rawStep] = match;
  const start = parseSliceBound(rawStart);

  // No separator at all means a single index
  if (rawStop === undefined) {
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
