import {
  CommandVariableTokenRegex,
  EscapedBraceRegex,
  VariableParamPlaceholderRegex,
  VariableSyntax,
  VariableTokenRegex,
} from "@/common/config";
import { BlockType, CommandSegmentType } from "@/common/enums";
import type { Block, CommandSegment, Variable } from "@/common/types";
import { generateId } from "@/utils/id";

export type VariableMap = Record<string, string>;

export function getVariableKey(variable: Variable): string {
  return variable.key.trim();
}

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
    const paramValue = part.slice(eqIndex + 1);

    if (paramKey && paramValue) {
      params[paramKey] = paramValue;
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
      CommandVariableTokenRegex,
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
    const key = getVariableKey(variable);
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

export function getUsedVariableKeys(
  blocks: Block[] = [],
  variables: Variable[] = [],
): Set<string> {
  const rawValues: Record<string, string> = {};
  for (const variable of variables) {
    const key = getVariableKey(variable);
    if (key) {
      rawValues[key] = variable.value;
    }
  }

  const pending: string[] = [];

  function collectRefs(text: string, tokenRegex: RegExp): void {
    for (const match of text.matchAll(tokenRegex)) {
      const raw = match[1];
      const key = raw.split(VariableSyntax.PARAM_SEPARATOR)[0].trim();
      if (key) {
        pending.push(key);
      }

      // Nested refs inside param values
      for (const inner of raw.matchAll(VariableTokenRegex)) {
        const innerKey = inner[1]
          .split(VariableSyntax.PARAM_SEPARATOR)[0]
          .trim();
        if (innerKey) {
          pending.push(innerKey);
        }
      }
    }
  }

  for (const block of blocks) {
    if (block.type === BlockType.COMMAND) {
      collectRefs(block.text, CommandVariableTokenRegex);
    }
  }

  const used = new Set<string>();
  while (pending.length > 0) {
    const key = pending.pop() as string;
    if (used.has(key)) {
      continue;
    }

    used.add(key);
    if (key in rawValues) {
      collectRefs(rawValues[key], VariableTokenRegex);
    }
  }

  return used;
}

export function isVariableUnused(
  variable: Variable,
  usedKeys: Set<string>,
): boolean {
  const key = getVariableKey(variable);
  return !!key && !usedKeys.has(key);
}

export function getSecretKeys(variables: Variable[] = []): Set<string> {
  return new Set(
    variables
      .filter((variable) => variable.secret && getVariableKey(variable))
      .map((variable) => getVariableKey(variable)),
  );
}

function unescapeBraces(text: string): string {
  return text.replace(EscapedBraceRegex, "$1");
}

export function renameVariableTokens(
  text: string,
  oldKey: string,
  newKey: string,
): string {
  const separator = VariableSyntax.PARAM_SEPARATOR;
  return text
    .split(`{${oldKey}}`)
    .join(`{${newKey}}`)
    .split(`{${oldKey}${separator}`)
    .join(`{${newKey}${separator}`);
}

export function renameAllVariableTokens(
  text: string,
  renames: ReadonlyMap<string, string>,
): string {
  let renamed = text;
  for (const [oldKey, newKey] of renames) {
    renamed = renameVariableTokens(renamed, oldKey, newKey);
  }

  return renamed;
}

function uniqueCopyKey(key: string, takenKeys: ReadonlySet<string>): string {
  const base = `${key}${VariableSyntax.COPY_SUFFIX}`;
  let candidate = base;
  let counter = 1; // Copy numbering start

  while (takenKeys.has(candidate)) {
    candidate = `${base}${counter}`;
    counter += 1;
  }

  return candidate;
}

export interface CarriedVariables {
  variables: Variable[];
  renames: Map<string, string>;
}

export function carryVariables(
  blocks: Block[],
  sourceVariables: Variable[],
  targetVariables: Variable[],
): CarriedVariables {
  const usedKeys = getUsedVariableKeys(blocks, sourceVariables);

  const targetByKey = new Map<string, Variable>();
  for (const variable of targetVariables) {
    const key = getVariableKey(variable);
    if (key && !targetByKey.has(key)) {
      targetByKey.set(key, variable);
    }
  }

  // A rename's output can never collide with another carried or renamed key
  const takenKeys = new Set<string>(targetByKey.keys());
  for (const variable of sourceVariables) {
    const key = getVariableKey(variable);
    if (key) {
      takenKeys.add(key);
    }
  }

  const variables: Variable[] = [];
  const renames = new Map<string, string>();

  for (const variable of sourceVariables) {
    const key = getVariableKey(variable);
    if (!key || !usedKeys.has(key)) {
      continue;
    }

    const existing = targetByKey.get(key);
    if (!existing) {
      variables.push({ ...variable, id: generateId() });
      continue;
    }

    const sameDefinition =
      existing.value === variable.value &&
      !!existing.secret === !!variable.secret;

    if (sameDefinition || renames.has(key)) {
      continue;
    }

    const newKey = uniqueCopyKey(key, takenKeys);
    takenKeys.add(newKey);
    renames.set(key, newKey);

    variables.push({ ...variable, id: generateId(), key: newKey });
  }

  if (renames.size === 0) {
    return { variables, renames };
  }

  // Carried values may themselves reference renamed keys
  return {
    variables: variables.map((variable) => {
      const value = renameAllVariableTokens(variable.value, renames);
      return value === variable.value ? variable : { ...variable, value };
    }),
    renames,
  };
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
          text: template ? unescapeBraces(text) : match[0],
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
      const { text, fullyResolved } = applyTemplateParams(value, {});

      segments.push({
        key: raw,
        text: value ? text : `{${raw}}`,
        type:
          value && fullyResolved
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
