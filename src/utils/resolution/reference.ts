import { ReferenceConfig } from "@/common/config";
import { ReferenceSurface } from "@/common/enums";
import type { ResolvedSpan } from "@/common/types";
import { VariableSyntax } from "@/common/variableSyntax";

import type { OperationChunk } from "./operations";
import { applyOperations } from "./operations";
import { applyTemplateParams, parseParam } from "./params";
import {
  flatSpans,
  mergeSpans,
  nestSpans,
  spansText,
  unresolvedSpans,
} from "./spans";
import type { ReferenceBodyChunk } from "./token";
import {
  replaceTemplateReferences,
  splitReferenceBody,
  splitReferenceParts,
  unescapeBraceSpans,
  unescapeBraces,
} from "./token";
import type { ResolvedValue, VariableLookup } from "./types";

/** Whether a `{;name}` blank reaches the end of the line on this surface. */
const BLANKS_ARE_FINAL: Record<ReferenceSurface, boolean> = {
  [ReferenceSurface.COMMAND]: true,
  [ReferenceSurface.VALUE]: false,
};

export interface ReferenceContext {
  surface: ReferenceSurface;
  lookup: VariableLookup;
}

interface ResolvedReference {
  key: string;
  text: string;
  resolved: boolean;
  spans: ResolvedSpan[];
  /**
   * Whether the braces spell a reference at all. A template blank and a brace
   * group carrying no operation do not.
   */
  isReference: boolean;
}

interface ResolvedChunk {
  text: string;
  spans: ResolvedSpan[];
  fullyResolved: boolean;
}

/**
 * An unnamed reference names no variable. It has to carry at least one
 * operation, and it must not open with a template blank.
 */
function unnamedValue(chunks: ReferenceBodyChunk[]): ResolvedValue | undefined {
  if (chunks[0]?.separator === VariableSyntax.PARAM_SEPARATOR) {
    return undefined;
  }

  return chunks.some(
    (chunk) => chunk.separator === VariableSyntax.OPERATION_SEPARATOR,
  )
    ? { text: "", spans: [] }
    : undefined;
}

/**
 * Resolves the references written inside a param value or an operation, before
 * either is parsed. It reports the spans of what it resolved too.
 */
function resolveChunk(
  text: string,
  context: ReferenceContext,
  key: string,
  depth: number,
  consumesEscapes: boolean,
): ResolvedChunk {
  let fullyResolved = true;
  const source = key || undefined;
  const literal = (raw: string): string =>
    consumesEscapes ? unescapeBraces(raw, context.surface) : raw;

  if (!text.includes(VariableSyntax.BRACE_OPEN)) {
    return { text, spans: flatSpans(text, source), fullyResolved };
  }

  const spans: ResolvedSpan[] = [];

  for (const part of splitReferenceParts(text, context.surface)) {
    if (!part.match) {
      spans.push(...flatSpans(literal(part.text), source));
      continue;
    }

    const reference = resolveReferenceAt(
      part.match.token,
      part.match.raw,
      context,
      depth,
    );

    if (!reference.resolved) {
      fullyResolved = false;
    }

    spans.push(...nestSpans(reference.spans));
  }

  const merged = mergeSpans(spans);
  return { text: spansText(merged), spans: merged, fullyResolved };
}

/** Describes a reference that did not resolve. */
function failedSpans(
  token: string,
  raw: string,
  context: ReferenceContext,
  depth: number,
): ResolvedSpan[] {
  if (!raw.includes(VariableSyntax.BRACE_OPEN)) {
    return unresolvedSpans(token);
  }

  const spans = unresolvedSpans(VariableSyntax.BRACE_OPEN);
  const keyEnd = splitReferenceBody(raw)[0].text.length;

  for (const part of splitReferenceParts(raw, context.surface)) {
    if (!part.match) {
      spans.push(...unresolvedSpans(part.text));
      continue;
    }

    const nested = resolveReferenceAt(
      part.match.token,
      part.match.raw,
      context,
      depth,
    );

    const shown =
      nested.isReference && (part.match.start >= keyEnd || !nested.resolved);

    spans.push(
      ...(shown ? nestSpans(nested.spans) : unresolvedSpans(part.match.token)),
    );
  }

  spans.push(...unresolvedSpans(VariableSyntax.BRACE_CLOSE));
  return mergeSpans(spans);
}

/**
 * Resolves the references a filled template produced, so a value that is itself
 * a template resolves rather than being emitted as literal text.
 */
function resolveFilledTemplate(
  text: string,
  context: ReferenceContext,
  depth: number,
): string {
  if (depth >= ReferenceConfig.MAX_TEMPLATE_DEPTH) {
    return text;
  }

  return replaceTemplateReferences(
    text,
    (match) =>
      resolveReferenceAt(match.token, match.raw, context, depth + 1).text,
  );
}

/** Resolves one `{KEY;params|operations}` reference against `context.lookup`. */
export function resolveReference(
  token: string,
  raw: string,
  context: ReferenceContext,
): ResolvedReference {
  return resolveReferenceAt(token, raw, context, 0);
}

function resolveReferenceAt(
  token: string,
  raw: string,
  context: ReferenceContext,
  depth: number,
): ResolvedReference {
  const [keyChunk, ...rest] = splitReferenceBody(raw);

  const key = keyChunk.text.trim();
  const rawReference = (isReference: boolean): ResolvedReference => {
    const spans = failedSpans(token, raw, context, depth);
    return { key, text: spansText(spans), resolved: false, isReference, spans };
  };
  const unresolvedReference = (): ResolvedReference => rawReference(true);

  const value = key ? context.lookup(key) : unnamedValue(rest);
  if (value === undefined) {
    // A key that resolved to nothing is a reference that failed; an empty key
    // reaching here is a blank or a brace group, which is not a reference.
    return rawReference(!!key);
  }

  const params: Record<string, ResolvedValue> = {};
  const operations: OperationChunk[] = [];

  for (const chunk of rest) {
    const isOperation = chunk.separator === VariableSyntax.OPERATION_SEPARATOR;
    const resolved = resolveChunk(chunk.text, context, key, depth, isOperation);

    if (isOperation) {
      operations.push({ text: resolved.text, spans: resolved.spans });
      continue;
    }

    if (!resolved.fullyResolved) {
      return unresolvedReference();
    }

    const param = parseParam(resolved);
    if (param) {
      params[param.name] = param.value;
    }
  }

  const final = BLANKS_ARE_FINAL[context.surface];
  const template = applyTemplateParams(value.text, {
    params,
    context: { key },
    final,
    spans: value.spans,
  });

  // A transform over an unfilled blank would quietly produce nonsense
  if (!template.fullyResolved && final && operations.length > 0) {
    return unresolvedReference();
  }

  // A refill drops the backslashes it carries on its way through
  const refilled = template.filled
    ? resolveFilledTemplate(template.text, context, depth)
    : null;

  const output =
    refilled === null
      ? unescapeBraceSpans(template, context.surface)
      : { text: refilled, spans: template.spans };

  const applied = applyOperations(output.text, operations, { key });
  if (!applied.ok) {
    return unresolvedReference();
  }

  if (key && !value.text && !applied.text) {
    return unresolvedReference();
  }

  const rewritten =
    operations.length > 0 || (refilled !== null && refilled !== template.text);

  return {
    key,
    text: applied.text,
    resolved: true,
    isReference: true,
    spans:
      applied.spans ??
      (rewritten ? flatSpans(applied.text, key || undefined) : output.spans),
  };
}
