import { ReferenceConfig } from "@/common/config";
import { ReferenceSurface } from "@/common/enums";
import type { ResolvedSpan } from "@/common/types";
import { VariableSyntax } from "@/common/variableSyntax";

import type { OperationChunk } from "./operations";
import { applyOperations } from "./operations";
import { applyTemplateParams, parseParam } from "./params";
import { flatSpans, mergeSpans, nestSpans, spansText } from "./spans";
import type { ReferenceBodyChunk } from "./token";
import {
  replaceTemplateReferences,
  splitReferenceBody,
  splitReferenceParts,
} from "./token";
import type { ResolvedValue, VariableLookup } from "./types";

/** Whether an unfilled `{;name}` blank may pass through instead of leaving the reference unresolved. */
const KEEPS_BLANKS: Record<ReferenceSurface, boolean> = {
  [ReferenceSurface.COMMAND]: false,
  [ReferenceSurface.VALUE]: true,
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
): ResolvedChunk {
  let fullyResolved = true;
  const source = key || undefined;
  const spans: ResolvedSpan[] = [];

  for (const part of splitReferenceParts(text, context.surface)) {
    if (!part.match) {
      spans.push(...flatSpans(part.text, source));
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
      spans.push(...flatSpans(reference.text, source));
      continue;
    }

    spans.push(...nestSpans(reference.spans));
  }

  const merged = mergeSpans(spans);
  return { text: spansText(merged), spans: merged, fullyResolved };
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
  const unresolvedReference = (): ResolvedReference => ({
    key,
    text: token,
    resolved: false,
    spans: flatSpans(token),
  });

  const value = key ? context.lookup(key) : unnamedValue(rest);
  if (value === undefined) {
    return unresolvedReference();
  }

  const params: Record<string, string> = {};
  const operations: OperationChunk[] = [];

  for (const chunk of rest) {
    const resolved = resolveChunk(chunk.text, context, key, depth);
    if (!resolved.fullyResolved) {
      return unresolvedReference();
    }

    if (chunk.separator === VariableSyntax.OPERATION_SEPARATOR) {
      operations.push({ text: resolved.text, spans: resolved.spans });
      continue;
    }

    const param = parseParam(resolved.text);
    if (param) {
      params[param.name] = param.value;
    }
  }

  const template = applyTemplateParams(
    value.text,
    params,
    { key },
    value.spans,
  );

  if (!template.fullyResolved && !KEEPS_BLANKS[context.surface]) {
    return unresolvedReference();
  }

  const filled = template.filled
    ? resolveFilledTemplate(template.text, context, depth)
    : template.text;

  const applied = applyOperations(filled, operations, { key });
  if (!applied.ok) {
    return unresolvedReference();
  }

  const rewritten = operations.length > 0 || filled !== template.text;
  return {
    key,
    text: applied.text,
    resolved: true,
    spans:
      applied.spans ??
      (rewritten ? flatSpans(applied.text, key || undefined) : template.spans),
  };
}
