import { CASE_OPERATION } from "./case";
import { COUNT_OPERATION } from "./count";
import { SLICE_OPERATION } from "./slice";
import { STRIP_OPERATION } from "./strip";
import type {
  OperationDefinition,
  OperationKeyword,
  OperationTransform,
} from "./types";

const OPERATION_DEFINITIONS: readonly OperationDefinition[] = [
  SLICE_OPERATION,
  COUNT_OPERATION,
  CASE_OPERATION,
  STRIP_OPERATION,
];

export function getOperationKeywords(): readonly OperationKeyword[] {
  return OPERATION_DEFINITIONS.flatMap((definition) => definition.keywords);
}

export function getCaseOperationKeywords(): readonly string[] {
  return CASE_OPERATION.keywords.map((keyword) => keyword.keyword).sort();
}

interface AppliedOperations {
  text: string;
  ok: boolean;
}

function parseOperation(operation: string): OperationTransform | null {
  for (const definition of OPERATION_DEFINITIONS) {
    const transform = definition.parse(operation);
    if (transform) {
      return transform;
    }
  }

  return null;
}

/** Runs a token's operations left to right. */
export function applyOperations(
  text: string,
  operations: string[],
): AppliedOperations {
  let result = text;

  for (const operation of operations) {
    const transform = parseOperation(operation);
    if (!transform) {
      return { text, ok: false };
    }

    result = transform(result);
  }

  return { text: result, ok: true };
}
