import { ReferenceSurface } from "@/common/enums";
import { VariableSyntax } from "@/common/variableSyntax";

import { applyOperations } from "./operations";
import { applyTemplateParams, parseParam } from "./params";
import { replaceReferences, splitReferenceBody } from "./token";
import type { VariableLookup } from "./types";

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
}

interface ResolvedChunk {
  text: string;
  fullyResolved: boolean;
}

/**
 * Resolves the references written inside a param value or an operation, before
 * either is parsed.
 */
function resolveChunk(text: string, context: ReferenceContext): ResolvedChunk {
  let fullyResolved = true;

  const resolved = replaceReferences(text, context.surface, (match) => {
    const reference = resolveReference(match.token, match.raw, context);
    if (!reference.resolved) {
      fullyResolved = false;
    }

    return reference.text;
  });

  return { text: resolved, fullyResolved };
}

/** Resolves one `{KEY;params|operations}` reference against `context.lookup`. */
export function resolveReference(
  token: string,
  raw: string,
  context: ReferenceContext,
): ResolvedReference {
  const [keyChunk, ...rest] = splitReferenceBody(raw);

  const key = keyChunk.text.trim();
  const unresolvedReference = (): ResolvedReference => ({
    key,
    text: token,
    resolved: false,
  });

  const value = context.lookup(key);
  if (value === undefined) {
    return unresolvedReference();
  }

  const params: Record<string, string> = {};
  const operations: string[] = [];

  for (const chunk of rest) {
    const resolved = resolveChunk(chunk.text, context);
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

  const template = applyTemplateParams(value, params);
  if (!template.fullyResolved && !KEEPS_BLANKS[context.surface]) {
    return unresolvedReference();
  }

  const applied = applyOperations(template.text, operations, { key });
  return applied.ok
    ? { key, text: applied.text, resolved: true }
    : unresolvedReference();
}
