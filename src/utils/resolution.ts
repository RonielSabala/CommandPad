import {
  CommandVariableTokenRegex,
  EscapedBraceRegex,
  SliceSyntax,
  TokenWhitespaceRegex,
  VariableParamPlaceholderRegex,
  VariableSliceRegex,
  VariableSyntax,
  VariableTokenRegex,
} from "@/common/config";
import { BlockType, CommandSegmentType } from "@/common/enums";
import type { Block, CommandSegment, Variable } from "@/common/types";
import { generateId } from "@/utils/id";
import { countLines, sliceString } from "@/utils/string";

export type VariableMap = Record<string, string>;

export function getVariableKey(variable: Variable): string {
  return variable.key.trim();
}

export function isConstantVariableKey(key: string): boolean {
  const trimmed = key.trim();
  return trimmed === trimmed.toUpperCase() && trimmed !== trimmed.toLowerCase();
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
    const paramValue = part.slice(eqIndex + 1).trim();

    if (paramKey && paramValue) {
      params[paramKey] = paramValue;
    }
  }

  return { key: rawKey.trim(), params };
}

interface TokenOperations {
  base: string;
  operations: string[];
}

/** Splits `KEY;params|op|op` into its base and its operations. */
function splitTokenOperations(raw: string): TokenOperations {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];

    if (char === VariableSyntax.BRACE_OPEN) {
      depth += 1;
    } else if (char === VariableSyntax.BRACE_CLOSE) {
      depth -= 1;
    } else if (char === VariableSyntax.OPERATION_SEPARATOR && depth === 0) {
      parts.push(raw.slice(start, i));
      start = i + 1;
    }
  }

  parts.push(raw.slice(start));

  return { base: parts[0], operations: parts.slice(1) };
}

function getTokenKey(raw: string): string {
  return splitTokenOperations(raw)
    .base.split(VariableSyntax.PARAM_SEPARATOR)[0]
    .trim();
}

interface SliceSpec {
  start: number | null;
  stop: number | null;
  step: number;
}

function parseSliceBound(raw: string): number | null {
  return raw ? Number(raw) : null;
}

function parseSliceOperation(operation: string): SliceSpec | null {
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

interface AppliedOperations {
  text: string;
  ok: boolean;
}

/** Runs a token's operations left to right. */
function applyOperations(
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

function resolveParamRefs(
  params: Record<string, string>,
  variableMap: VariableMap,
): { params: Record<string, string>; fullyResolved: boolean } {
  let fullyResolved = true;
  const resolved: Record<string, string> = {};

  for (const [name, value] of Object.entries(params)) {
    resolved[name] = value.replace(
      CommandVariableTokenRegex,
      (match, rawRef: string) => {
        const refKey = rawRef.trim();
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
    (match, rawName: string) => {
      const paramName = rawName.trim();
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
    const resolved = raw.replace(
      VariableTokenRegex,
      (match, rawRef: string) => {
        const refKey = rawRef.trim();
        return refKey in rawMap
          ? resolveValue(refKey, new Set(visitedKeys))
          : match;
      },
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
      const key = getTokenKey(raw);
      if (key) {
        pending.push(key);
      }

      // Nested refs inside param values
      for (const inner of raw.matchAll(VariableTokenRegex)) {
        const innerKey = getTokenKey(inner[1]);
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

function braceToken(raw: string): string {
  return `${VariableSyntax.BRACE_OPEN}${raw}${VariableSyntax.BRACE_CLOSE}`;
}

function renameTokenKey(
  token: string,
  raw: string,
  oldKey: string,
  newKey: string,
): string {
  // A reference inside a param value is a token in its own right
  const inner = raw.replace(VariableTokenRegex, (nested, nestedRaw: string) =>
    renameTokenKey(nested, nestedRaw, oldKey, newKey),
  );

  if (getTokenKey(inner) !== oldKey) {
    return inner === raw ? token : braceToken(inner);
  }

  // The key opens the token, so its first occurrence is the key itself
  const at = inner.indexOf(oldKey);

  return braceToken(
    `${inner.slice(0, at)}${newKey}${inner.slice(at + oldKey.length)}`,
  );
}

export function renameVariableTokens(
  text: string,
  oldKey: string,
  newKey: string,
): string {
  if (!oldKey) {
    return text;
  }

  return text.replace(VariableTokenRegex, (token, raw: string) =>
    renameTokenKey(token, raw, oldKey, newKey),
  );
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

export function uniqueCopyKey(
  key: string,
  takenKeys: ReadonlySet<string>,
): string {
  const stem = key.replace(VariableSyntax.COPY_SUFFIX_REGEX, "");
  const base = `${stem}${VariableSyntax.COPY_SUFFIX}`;
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

export function isMaskedSegment(
  segment: CommandSegment,
  secretKeys: ReadonlySet<string>,
): boolean {
  return (
    segment.type === CommandSegmentType.RESOLVED &&
    !!segment.key &&
    secretKeys.has(segment.key)
  );
}

export function countCommandLines(
  segments: CommandSegment[],
  secretKeys: ReadonlySet<string>,
): number {
  return segments.reduce(
    (lines, segment) =>
      isMaskedSegment(segment, secretKeys)
        ? lines
        : lines + countLines(segment.text) - 1,
    1,
  );
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
