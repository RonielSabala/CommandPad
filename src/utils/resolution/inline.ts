import { ReferenceSurface } from "@/common/enums";
import type { Variable } from "@/common/types";

import { getTemplateParamNames } from "./params";
import { resolveReference } from "./reference";
import { hasUnresolvedSpans } from "./spans";
import type { ReferenceMatch } from "./token";
import { scanReferences, splitReferenceBody } from "./token";
import type { VariableMap } from "./types";
import { getVariableKey, getVariableMap } from "./variables";

interface InlineScope {
  variableMap: VariableMap;
  /** The same without secrets. */
  visibleMap: VariableMap;
  /** The raw values of the variables that aren't secret. */
  rawValues: Map<string, string>;
}

const SCOPES = new WeakMap<Variable[], InlineScope>();

function inlineScope(variables: Variable[]): InlineScope {
  let scope = SCOPES.get(variables);
  if (scope) {
    return scope;
  }

  const visible = variables.filter((variable) => !variable.secret);
  scope = {
    variableMap: getVariableMap(variables),
    visibleMap: getVariableMap(visible),
    rawValues: new Map(
      visible.map((variable) => [getVariableKey(variable), variable.value]),
    ),
  };

  SCOPES.set(variables, scope);
  return scope;
}

function resolvedText(
  match: ReferenceMatch,
  variableMap: VariableMap,
): string | null {
  const reference = resolveReference(match.token, match.raw, {
    surface: ReferenceSurface.VALUE,
    lookup: (key) =>
      Object.hasOwn(variableMap, key) ? variableMap[key] : undefined,
  });

  return reference.key &&
    reference.resolved &&
    !hasUnresolvedSpans(reference.spans)
    ? reference.text
    : null;
}

/** Replaces every named reference in `text` that fully resolves with its content. */
export function inlineReferences(text: string, variables: Variable[]): string {
  const { variableMap, visibleMap, rawValues } = inlineScope(variables);
  let result = "";
  let lastEnd = 0;

  for (const match of scanReferences(text, ReferenceSurface.COMMAND)) {
    if (resolvedText(match, variableMap) === null) {
      continue;
    }

    const [keyChunk, ...rest] = splitReferenceBody(match.raw);
    const raw = rawValues.get(keyChunk.text.trim());
    const content =
      raw !== undefined &&
      rest.length === 0 &&
      getTemplateParamNames(raw).length === 0
        ? raw
        : resolvedText(match, visibleMap);

    if (content !== null) {
      result += text.slice(lastEnd, match.start) + content;
      lastEnd = match.end;
    }
  }

  return result + text.slice(lastEnd);
}
