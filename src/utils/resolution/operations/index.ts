import type { ResolvedSpan } from "@/common/types";
import { CallGroup, OperationKeywordRegex } from "@/common/variableSyntax";
import { isString } from "@/utils/typeGuards";

import { spansText } from "../spans";
import { CASE_OPERATION } from "./case";
import { COMPARE_OPERATION } from "./compare";
import { IF_OPERATION } from "./conditional";
import { COUNT_OPERATION } from "./count";
import { DATE_OPERATION } from "./date";
import { FILL_OPERATION } from "./fill";
import { INDEX_OPERATION } from "./indexOf";
import { INSERT_OPERATION } from "./insert";
import { JUST_OPERATION } from "./just";
import { KEY_OPERATION } from "./key";
import { LEN_OPERATION } from "./len";
import { LOGIC_OPERATION } from "./logic";
import { MATCH_OPERATION } from "./match";
import { REMOVE_OPERATION } from "./remove";
import { REPLACE_OPERATION } from "./replace";
import { SLICE_OPERATION } from "./slice";
import { STRIP_OPERATION } from "./strip";
import { TEST_OPERATION } from "./test";
import type {
  OperationChunk,
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
  JUST_OPERATION,
  REPLACE_OPERATION,
  REMOVE_OPERATION,
  INDEX_OPERATION,
  INSERT_OPERATION,
  TEST_OPERATION,
  MATCH_OPERATION,
  LOGIC_OPERATION,
  COMPARE_OPERATION,
  IF_OPERATION,
];

export type { OperationChunk } from "./types";

export function getOperationKeywords(): readonly OperationKeyword[] {
  return OPERATION_DEFINITIONS.flatMap((definition) => definition.keywords);
}

export function getCaseOperationKeywords(): readonly string[] {
  return CASE_OPERATION.keywords.map((keyword) => keyword.keyword).sort();
}

interface AppliedOperations {
  text: string;
  ok: boolean;
  spans?: ResolvedSpan[];
}

const DEFINITIONS_BY_KEYWORD = new Map(
  OPERATION_DEFINITIONS.flatMap((definition) =>
    definition.keywords.map(({ keyword }) => [keyword, definition] as const),
  ),
);

function parseOperation(operation: OperationChunk): OperationTransform | null {
  const keyword = OperationKeywordRegex.exec(operation.text)?.groups?.[
    CallGroup.KEYWORD
  ];

  const definition = keyword && DEFINITIONS_BY_KEYWORD.get(keyword);
  return definition ? definition.parse(operation) : null;
}

/** Runs a token's operations left to right. */
export function applyOperations(
  text: string,
  operations: readonly OperationChunk[],
  context: OperationContext,
): AppliedOperations {
  let result = text;
  let spans: ResolvedSpan[] | undefined;

  for (const operation of operations) {
    const transform = parseOperation(operation);
    if (!transform) {
      return { text, ok: false };
    }

    const output = transform(result, context);
    if (isString(output)) {
      result = output;
      spans = undefined;
      continue;
    }

    result = output.text;
    spans = spansText(output.spans) === output.text ? output.spans : undefined;
  }

  return { text: result, ok: true, spans };
}
