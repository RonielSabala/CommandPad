import { ReferenceConfig } from "@/common/config";
import { ReferenceSurface } from "@/common/enums";
import type { ResolvedSpan } from "@/common/types";
import { VariableSyntax } from "@/common/variableSyntax";

import { applyOperations } from "./operations";
import { applyTemplateParams, parseParam } from "./params";
import { flatSpans } from "./spans";
import type { ReferenceBodyChunk } from "./token";
import {
  replaceReferences,
  replaceTemplateReferences,
  splitReferenceBody,
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
 * either is parsed.
 */
function resolveChunk(
  text: string,
  context: ReferenceContext,
  depth: number,
): ResolvedChunk {
  let fullyResolved = true;

  const resolved = replaceReferences(text, context.surface, (match) => {
    const reference = resolveReferenceAt(
      match.token,
      match.raw,
      context,
      depth,
    );
    if (!reference.resolved) {
      fullyResolved = false;
    }

    return reference.text;
  });

  return { text: resolved, fullyResolved };
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
  const operations: string[] = [];

  for (const chunk of rest) {
    const resolved = resolveChunk(chunk.text, context, depth);
    if (!resolved.fullyResolved) {
      return unresolvedReference();
    }

    if (chunk.separator === VariableSyntax.OPERATION_SEPARATOR) {
      operations.push(resolved.text);
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
    spans: rewritten ? flatSpans(applied.text) : template.spans,
  };
}
