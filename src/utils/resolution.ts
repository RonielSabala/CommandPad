import {
  CommandVariableTokenRegex,
  EscapedBraceRegex,
  VariableParamPlaceholderRegex,
  VariableSyntax,
  VariableTokenRegex,
} from "@/common/config";
import { CommandSegmentType } from "@/common/enums";
import type { CommandSegment, Variable } from "@/common/types";

export type VariableMap = Record<string, string>;

interface ParsedVariableToken {
  key: string;
  params: Record<string, string>;
}

function parseVariableToken(raw: string): ParsedVariableToken {
  const [rawKey, ...rawParams] = raw.split(VariableSyntax.PARAM_SEPARATOR);
  const params: Record<string, string> = {};

  for (const part of rawParams) {
    const eqIndex = part.indexOf(VariableSyntax.PARAM_ASSIGNMENT);
    if (eqIndex === -1) {
      continue;
    }

    const paramKey = part.slice(0, eqIndex).trim();
    if (paramKey) {
      params[paramKey] = part.slice(eqIndex + 1);
    }
  }

  return { key: rawKey.trim(), params };
}

function resolveParamRefs(
  params: Record<string, string>,
  variableMap: VariableMap,
): { params: Record<string, string>; fullyResolved: boolean } {
  let fullyResolved = true;
  const resolved: Record<string, string> = {};

  for (const [name, value] of Object.entries(params)) {
    resolved[name] = value.replace(
      VariableTokenRegex,
      (match, refKey: string) => {
        if (
          Object.prototype.hasOwnProperty.call(variableMap, refKey) &&
          variableMap[refKey]
        ) {
          return variableMap[refKey];
        }

        fullyResolved = false;
        return match;
      },
    );
  }

  return { params: resolved, fullyResolved };
}

function applyTemplateParams(
  template: string,
  params: Record<string, string>,
): { text: string; fullyResolved: boolean } {
  let fullyResolved = true;

  const text = template.replace(
    VariableParamPlaceholderRegex,
    (match, paramName: string) => {
      if (paramName in params) {
        return params[paramName];
      }

      fullyResolved = false;
      return match;
    },
  );

  return { text, fullyResolved };
}

export function getVariableMap(variables: Variable[] = []): VariableMap {
  const rawMap: VariableMap = {};
  const resolvedMap: VariableMap = {};

  for (const variable of variables) {
    const key = variable.key.trim();
    if (!key) {
      continue;
    }

    rawMap[key] = variable.value;
  }

  function resolveValue(key: string, visitedKeys = new Set<string>()): string {
    if (key in resolvedMap) {
      return resolvedMap[key];
    }

    if (visitedKeys.has(key)) {
      return `{${key}}`;
    }

    visitedKeys.add(key);
    const raw = rawMap[key] ?? "";
    const resolved = raw.replace(VariableTokenRegex, (match, refKey: string) =>
      refKey in rawMap ? resolveValue(refKey, new Set(visitedKeys)) : match,
    );

    resolvedMap[key] = resolved;
    return resolved;
  }

  for (const key of Object.keys(rawMap)) {
    resolveValue(key);
  }

  return resolvedMap;
}

export function getSecretKeys(variables: Variable[] = []): Set<string> {
  return new Set(
    variables
      .filter((variable) => variable.secret && variable.key.trim())
      .map((variable) => variable.key.trim()),
  );
}

function unescapeBraces(text: string): string {
  return text.replace(EscapedBraceRegex, "$1");
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

    const raw = match[1];
    if (raw.includes(VariableSyntax.PARAM_SEPARATOR)) {
      const { key, params } = parseVariableToken(raw);

      if (Object.prototype.hasOwnProperty.call(variableMap, key)) {
        const template = variableMap[key];
        const paramRefs = resolveParamRefs(params, variableMap);
        const { text, fullyResolved } = applyTemplateParams(
          template,
          paramRefs.params,
        );

        segments.push({
          key,
          text: template ? text : match[0],
          type:
            template && fullyResolved && paramRefs.fullyResolved
              ? CommandSegmentType.RESOLVED
              : CommandSegmentType.UNRESOLVED,
        });
      } else {
        segments.push({ text: match[0], type: CommandSegmentType.UNRESOLVED });
      }
    } else if (Object.prototype.hasOwnProperty.call(variableMap, raw)) {
      const value = variableMap[raw];
      segments.push({
        key: raw,
        text: value || `{${raw}}`,
        type: value
          ? CommandSegmentType.RESOLVED
          : CommandSegmentType.UNRESOLVED,
      });
    } else {
      segments.push({ text: match[0], type: CommandSegmentType.UNRESOLVED });
    }

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
