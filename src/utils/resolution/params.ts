import { VariableSyntax } from "@/common/variableSyntax";

import { applyOperations } from "./operations";
import type { OperationContext } from "./operations/types";
import { scanBraces, splitReferenceBody } from "./token";

interface ReferenceParam {
  name: string;
  value: string;
}

interface TemplateBlank {
  name: string;
  fallback?: string;
  operations: string[];
}

interface ResolvedTemplate {
  text: string;
  fullyResolved: boolean;
  /** Whether a blank was actually filled. */
  filled: boolean;
}

export function parseParam(chunk: string): ReferenceParam | null {
  const at = chunk.indexOf(VariableSyntax.PARAM_ASSIGNMENT);
  if (at === -1) {
    return null;
  }

  const name = chunk.slice(0, at).trim();
  const value = chunk.slice(at + 1).trim();

  return name && value ? { name, value } : null;
}

function parseBlankName(
  chunk: string,
): Pick<TemplateBlank, "name" | "fallback"> | null {
  const at = chunk.indexOf(VariableSyntax.PARAM_ASSIGNMENT);
  if (at === -1) {
    const name = chunk.trim();
    return name ? { name } : null;
  }

  const name = chunk.slice(0, at).trim();
  return name ? { name, fallback: chunk.slice(at + 1).trim() } : null;
}

function parseBlank(body: string): TemplateBlank | null {
  const [nameChunk, ...rest] = splitReferenceBody(body);
  const declaration = parseBlankName(nameChunk.text);
  if (!declaration) {
    return null;
  }

  const operations: string[] = [];

  for (const chunk of rest) {
    if (chunk.separator !== VariableSyntax.OPERATION_SEPARATOR) {
      return null;
    }

    operations.push(chunk.text);
  }

  return { ...declaration, operations };
}

/** Every blank opens with this. */
const BLANK_OPEN = `${VariableSyntax.BRACE_OPEN}${VariableSyntax.PARAM_SEPARATOR}`;

interface BlankMatch {
  blank: TemplateBlank;
  start: number;
  end: number;
}

/** Every blank a template declares. */
function readBlanks(template: string): BlankMatch[] {
  const blanks: BlankMatch[] = [];
  if (!template.includes(BLANK_OPEN)) {
    return blanks;
  }

  for (const match of scanBraces(template, false)) {
    if (!match.raw.startsWith(VariableSyntax.PARAM_SEPARATOR)) {
      continue;
    }

    const blank = parseBlank(match.raw.slice(1));
    if (blank) {
      blanks.push({ blank, start: match.start, end: match.end });
    }
  }

  return blanks;
}

function collectBlankDefaults(blanks: BlankMatch[]): Record<string, string> {
  const defaults: Record<string, string> = {};

  for (const { blank } of blanks) {
    if (blank.fallback !== undefined && !(blank.name in defaults)) {
      defaults[blank.name] = blank.fallback;
    }
  }

  return defaults;
}

export function getTemplateParamNames(template: string): string[] {
  const names = new Set<string>();

  for (const { blank } of readBlanks(template)) {
    names.add(blank.name);
  }

  return [...names];
}

/** A blank's value, resolved against `params` first and its declared default otherwise. */
function blankValue(
  name: string,
  params: Record<string, string>,
  defaults: Record<string, string>,
  context: OperationContext,
  cache: Map<string, string | undefined>,
  resolving: Set<string>,
): string | undefined {
  if (cache.has(name)) {
    return cache.get(name);
  }

  if (name in params) {
    cache.set(name, params[name]);
    return params[name];
  }

  const fallback = defaults[name];
  if (fallback === undefined || resolving.has(name)) {
    cache.set(name, undefined);
    return undefined;
  }

  resolving.add(name);
  const resolved = substituteBlanks(
    fallback,
    params,
    defaults,
    context,
    cache,
    resolving,
  );

  resolving.delete(name);

  const value = resolved.fullyResolved ? resolved.text : undefined;
  cache.set(name, value);
  return value;
}

function substituteBlanks(
  template: string,
  params: Record<string, string>,
  defaults: Record<string, string>,
  context: OperationContext,
  cache: Map<string, string | undefined>,
  resolving: Set<string>,
): ResolvedTemplate {
  return fillBlanks(
    template,
    readBlanks(template),
    params,
    defaults,
    context,
    cache,
    resolving,
  );
}

function fillBlanks(
  template: string,
  blanks: BlankMatch[],
  params: Record<string, string>,
  defaults: Record<string, string>,
  context: OperationContext,
  cache: Map<string, string | undefined>,
  resolving: Set<string>,
): ResolvedTemplate {
  if (blanks.length === 0) {
    return { text: template, fullyResolved: true, filled: false };
  }

  let fullyResolved = true;
  let filled = false;
  let text = "";
  let lastEnd = 0;

  for (const { blank, start, end } of blanks) {
    text += template.slice(lastEnd, start);
    lastEnd = end;

    const value = blankValue(
      blank.name,
      params,
      defaults,
      context,
      cache,
      resolving,
    );
    const applied =
      value === undefined
        ? null
        : applyOperations(value, blank.operations, context);

    if (!applied?.ok) {
      fullyResolved = false;
      text += template.slice(start, end);
      continue;
    }

    filled = true;
    text += applied.text;
  }

  return { text: text + template.slice(lastEnd), fullyResolved, filled };
}

export function applyTemplateParams(
  template: string,
  params: Record<string, string>,
  context: OperationContext,
): ResolvedTemplate {
  const blanks = readBlanks(template);
  if (blanks.length === 0) {
    return { text: template, fullyResolved: true, filled: false };
  }

  const defaults = collectBlankDefaults(blanks);
  return fillBlanks(
    template,
    blanks,
    params,
    defaults,
    context,
    new Map(),
    new Set(),
  );
}
