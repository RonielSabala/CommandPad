import { CommandVariableTokenRegex, VariableSyntax } from "@/common/config";
import { CommandSegmentType } from "@/common/enums";
import type { CommandSegment } from "@/common/types";

import { applyOperations } from "./operations";
import {
  applyTemplateParams,
  parseVariableToken,
  resolveParamRefs,
} from "./params";
import { splitTokenOperations, unescapeBraces } from "./token";
import type { VariableMap } from "./types";

/**
 * Applies a token's operations to an already-resolved value. An operation that does
 * not parse leaves the whole token unresolved.
 */
function buildTokenSegment(
  token: string,
  key: string,
  text: string,
  resolved: boolean,
  operations: string[],
): CommandSegment {
  if (!resolved) {
    return { key, text, type: CommandSegmentType.UNRESOLVED };
  }

  const applied = applyOperations(text, operations);

  return applied.ok
    ? { key, text: applied.text, type: CommandSegmentType.RESOLVED }
    : { key, text: token, type: CommandSegmentType.UNRESOLVED };
}

function resolveToken(
  token: string,
  raw: string,
  variableMap: VariableMap,
): CommandSegment {
  const { base, operations } = splitTokenOperations(raw);

  if (base.includes(VariableSyntax.PARAM_SEPARATOR)) {
    const { key, params } = parseVariableToken(base);

    if (!Object.prototype.hasOwnProperty.call(variableMap, key)) {
      return { text: token, type: CommandSegmentType.UNRESOLVED };
    }

    const template = variableMap[key];
    const paramRefs = resolveParamRefs(params, variableMap);
    const { text, fullyResolved } = applyTemplateParams(
      template,
      paramRefs.params,
    );

    return buildTokenSegment(
      token,
      key,
      template ? unescapeBraces(text) : token,
      !!template && fullyResolved && paramRefs.fullyResolved,
      operations,
    );
  }

  const key = base.trim();
  if (!Object.prototype.hasOwnProperty.call(variableMap, key)) {
    return { text: token, type: CommandSegmentType.UNRESOLVED };
  }

  const value = variableMap[key];
  const { text, fullyResolved } = applyTemplateParams(value, {});

  return buildTokenSegment(
    token,
    key,
    value ? text : token,
    !!value && fullyResolved,
    operations,
  );
}

export function resolveCommandText(
  rawText: string,
  variableMap: VariableMap,
): CommandSegment[] {
  let lastIndex = 0;
  const segments: CommandSegment[] = [];

  for (const match of rawText.matchAll(CommandVariableTokenRegex)) {
    const matchIdx = match.index;
    if (matchIdx > lastIndex) {
      segments.push({
        text: unescapeBraces(rawText.slice(lastIndex, matchIdx)),
        type: CommandSegmentType.LITERAL,
      });
    }

    segments.push(resolveToken(match[0], match[1], variableMap));
    lastIndex = matchIdx + match[0].length;
  }

  if (lastIndex < rawText.length) {
    segments.push({
      text: unescapeBraces(rawText.slice(lastIndex)),
      type: CommandSegmentType.LITERAL,
    });
  }

  return segments;
}

export function resolveCommandToString(
  rawText: string,
  variableMap: VariableMap,
): string {
  return resolveCommandText(rawText, variableMap)
    .map((segment) => segment.text)
    .join("");
}

export function hasUnresolvedTokens(
  rawText: string,
  variableMap: VariableMap,
): boolean {
  return resolveCommandText(rawText, variableMap).some(
    (segment) => segment.type === CommandSegmentType.UNRESOLVED,
  );
}
