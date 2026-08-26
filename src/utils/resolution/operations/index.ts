import { CASE_OPERATION } from "./case";
import { COMPARE_OPERATION } from "./compare";
import { IF_OPERATION } from "./conditional";
import { COUNT_OPERATION } from "./count";
import { DATE_OPERATION } from "./date";
import { FILL_OPERATION } from "./fill";
import { KEY_OPERATION } from "./key";
import { LEN_OPERATION } from "./len";
import { LOGIC_OPERATION } from "./logic";
import { MATCH_OPERATION } from "./match";
import { SLICE_OPERATION } from "./slice";
import { STRIP_OPERATION } from "./strip";
import { TEST_OPERATION } from "./test";
import type {
  OperationContext,
  OperationDefinition,
  OperationKeyword,
  OperationTransform,
} from "./types";

const OPERATION_DEFINITIONS: readonly OperationDefinition[] = [
  SLICE_OPERATION,
  LEN_OPERATION,
  COUNT_OPERATION,
  KEY_OPERATION,
  DATE_OPERATION,
  CASE_OPERATION,
  STRIP_OPERATION,
  FILL_OPERATION,
  TEST_OPERATION,
  MATCH_OPERATION,
  LOGIC_OPERATION,
  COMPARE_OPERATION,
  IF_OPERATION,
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
  context: OperationContext,
): AppliedOperations {
  let result = text;

  for (const operation of operations) {
    const transform = parseOperation(operation);
    if (!transform) {
      return { text, ok: false };
    }

    result = transform(result, context);
  }

  return { text: result, ok: true };
}
