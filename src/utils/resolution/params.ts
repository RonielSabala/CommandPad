import { ESCAPE_CHAR } from "@/common/regex";
import type { ResolvedSpan } from "@/common/types";
import { VariableSyntax } from "@/common/variableSyntax";

import { applyOperations } from "./operations";
import type { OperationChunk, OperationContext } from "./operations/types";
import {
  flatSpans,
  mergeSpans,
  placeSpans,
  sliceSpans,
  spanAt,
  spansText,
  trimSpans,
  unresolvedSpans,
} from "./spans";
import { scanBraces, splitReferenceBody } from "./token";
import type { ResolvedValue } from "./types";

interface ReferenceParam {
  name: string;
  value: ResolvedValue;
}

interface TemplateBlank {
  name: string;
  fallback?: string;
  operations: OperationChunk[];
}

interface ResolvedTemplate {
  text: string;
  fullyResolved: boolean;
  /** Whether a blank was actually filled. */
  filled: boolean;
  spans: ResolvedSpan[];
}

export function parseParam(chunk: ResolvedValue): ReferenceParam | null {
  const at = chunk.text.indexOf(VariableSyntax.PARAM_ASSIGNMENT);
  if (at === -1) {
    return null;
  }

  const name = chunk.text.slice(0, at).trim();
  const spans = trimSpans(sliceSpans(chunk.spans, at + 1, chunk.text.length));
  const text = spansText(spans);

  return name && text ? { name, value: { text, spans } } : null;
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

  const operations: OperationChunk[] = [];

  for (const chunk of rest) {
    if (chunk.separator !== VariableSyntax.OPERATION_SEPARATOR) {
      return null;
    }

    operations.push({ text: chunk.text });
  }

  return { ...declaration, operations };
}

/** How a blank names itself, `key` being the variable whose value declares it. */
function blankSource(key: string, name: string): string | undefined {
  return key ? `${key}${VariableSyntax.PARAM_SEPARATOR}${name}` : undefined;
}

/** Every blank opens with this. */
const BLANK_OPEN = `${VariableSyntax.BRACE_OPEN}${VariableSyntax.PARAM_SEPARATOR}`;

interface BlankMatch {
  blank: TemplateBlank;
  escaped: boolean;
  /** Whether another variable declared it. */
  foreign?: boolean;
  start: number;
  end: number;
}

interface BlankScope {
  params: Record<string, ResolvedValue>;
  defaults: Record<string, string>;
  context: OperationContext;
  /** Whether a blank reaches the end of the line. */
  final: boolean;
  /** Each name's resolved value. */
  cache: Map<string, ResolvedValue | undefined>;
  /** The names being resolved. */
  resolving: Set<string>;
}

/**
 * Collects the blanks in `text`, whose index 0 sits at `offset` in the template
 * the spans are reported against.
 */
function collectBlanks(
  text: string,
  offset: number,
  blanks: BlankMatch[],
): void {
  if (!text.includes(BLANK_OPEN)) {
    return;
  }

  for (const match of scanBraces(text, false)) {
    const blank = match.raw.startsWith(VariableSyntax.PARAM_SEPARATOR)
      ? parseBlank(match.raw.slice(1))
      : null;

    if (blank) {
      const escaped = text[match.start - 1] === ESCAPE_CHAR;
      blanks.push({
        blank,
        escaped,
        start: offset + match.start - (escaped ? 1 : 0),
        end: offset + match.end,
      });
      continue;
    }

    collectBlanks(match.raw, offset + match.start + 1, blanks);
  }
}

/** Every blank a template declares, in ascending order. */
function readBlanks(template: string): BlankMatch[] {
  const blanks: BlankMatch[] = [];
  collectBlanks(template, 0, blanks);
  return blanks;
}

function collectBlankDefaults(blanks: BlankMatch[]): Record<string, string> {
  const defaults: Record<string, string> = {};

  for (const { blank, escaped, foreign } of blanks) {
    if (
      !escaped &&
      !foreign &&
      blank.fallback !== undefined &&
      !(blank.name in defaults)
    ) {
      defaults[blank.name] = blank.fallback;
    }
  }

  return defaults;
}

function addBlankNames(template: string, names: Set<string>): void {
  for (const { blank, escaped } of readBlanks(template)) {
    if (escaped) {
      continue;
    }

    names.add(blank.name);

    if (blank.fallback !== undefined) {
      addBlankNames(blank.fallback, names);
    }
  }
}

export function getTemplateParamNames(template: string): string[] {
  const names = new Set<string>();
  addBlankNames(template, names);
  return [...names];
}

/** A blank's value, resolved against `params` first and its declared default otherwise. */
function blankValue(
  name: string,
  scope: BlankScope,
): ResolvedValue | undefined {
  const { params, cache, resolving } = scope;

  if (cache.has(name)) {
    return cache.get(name);
  }

  if (name in params) {
    cache.set(name, params[name]);
    return params[name];
  }

  const fallback = scope.defaults[name];
  if (fallback === undefined || resolving.has(name)) {
    cache.set(name, undefined);
    return undefined;
  }

  resolving.add(name);
  const resolved = substituteBlanks(fallback, scope);
  resolving.delete(name);

  const value = resolved.fullyResolved
    ? { text: resolved.text, spans: resolved.spans }
    : undefined;
  cache.set(name, value);
  return value;
}

function substituteBlanks(
  template: string,
  scope: BlankScope,
): ResolvedTemplate {
  return fillBlanks(template, flatSpans(template), readBlanks(template), scope);
}

function fillBlanks(
  template: string,
  spans: readonly ResolvedSpan[],
  blanks: BlankMatch[],
  scope: BlankScope,
): ResolvedTemplate {
  if (blanks.length === 0) {
    return {
      text: template,
      fullyResolved: true,
      filled: false,
      spans: [...spans],
    };
  }

  let fullyResolved = true;
  let filled = false;
  let text = "";
  let lastEnd = 0;
  const pieces: ResolvedSpan[] = [];

  for (const { blank, escaped, foreign, start, end } of blanks) {
    text += template.slice(lastEnd, start);
    pieces.push(...sliceSpans(spans, lastEnd, start));
    lastEnd = end;

    if (escaped) {
      const from = scope.final ? start + 1 : start;
      text += template.slice(from, end);
      pieces.push(...sliceSpans(spans, from, end));
      continue;
    }

    // How deep the blank sits and which variable declares it
    const wrote = spanAt(spans, start);
    const source = blankSource(wrote?.source ?? scope.context.key, blank.name);
    const depth = (wrote?.depth ?? 0) + 1;

    const value = foreign ? undefined : blankValue(blank.name, scope);
    const applied =
      value === undefined
        ? null
        : applyOperations(value.text, blank.operations, scope.context);

    if (!applied?.ok) {
      const raw = template.slice(start, end);
      fullyResolved = false;
      text += raw;
      pieces.push(
        ...(scope.final
          ? unresolvedSpans(raw, depth, source)
          : sliceSpans(spans, start, end)),
      );

      continue;
    }

    filled = true;
    text += applied.text;

    // The filling text keeps its own nesting, unless an operation rewrote it
    const produced =
      applied.spans ?? (blank.operations.length > 0 ? undefined : value?.spans);

    pieces.push(
      ...(produced
        ? placeSpans(produced, depth, source)
        : [{ text: applied.text, depth, source }]),
    );
  }

  pieces.push(...sliceSpans(spans, lastEnd, template.length));
  return {
    text: text + template.slice(lastEnd),
    fullyResolved,
    filled,
    spans: mergeSpans(pieces),
  };
}

interface TemplateOptions {
  params: Record<string, ResolvedValue>;
  context: OperationContext;
  final: boolean;
  spans?: readonly ResolvedSpan[];
}

export function applyTemplateParams(
  template: string,
  { params, context, final, spans = flatSpans(template) }: TemplateOptions,
): ResolvedTemplate {
  const blanks = readBlanks(template).map((match) => ({
    ...match,
    foreign:
      (spanAt(spans, match.start)?.source ?? context.key) !== context.key,
  }));

  return fillBlanks(template, spans, blanks, {
    params,
    defaults: collectBlankDefaults(blanks),
    context,
    final,
    cache: new Map(),
    resolving: new Set(),
  });
}
