import {
  VariableParamPlaceholderRegex,
  VariableSyntax,
} from "@/common/variableSyntax";

import { applyOperations } from "./operations";
import type { OperationContext } from "./operations/types";
import { splitReferenceBody } from "./token";

interface ReferenceParam {
  name: string;
  value: string;
}

interface TemplateBlank {
  name: string;
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

function parseBlank(body: string): TemplateBlank | null {
  const [nameChunk, ...rest] = splitReferenceBody(body);
  const name = nameChunk.text.trim();
  if (!name) {
    return null;
  }

  const operations: string[] = [];

  for (const chunk of rest) {
    if (chunk.separator !== VariableSyntax.OPERATION_SEPARATOR) {
      return null;
    }

    operations.push(chunk.text);
  }

  return { name, operations };
}

export function getTemplateParamNames(template: string): string[] {
  const names = new Set<string>();

  for (const [, body] of template.matchAll(VariableParamPlaceholderRegex)) {
    const blank = parseBlank(body);
    if (blank) {
      names.add(blank.name);
    }
  }

  return [...names];
}

export function applyTemplateParams(
  template: string,
  params: Record<string, string>,
  context: OperationContext,
): ResolvedTemplate {
  let fullyResolved = true;
  let filled = false;

  const text = template.replace(
    VariableParamPlaceholderRegex,
    (match, body: string) => {
      const blank = parseBlank(body);
      if (!blank) {
        return match;
      }

      if (!(blank.name in params)) {
        fullyResolved = false;
        return match;
      }

      const applied = applyOperations(
        params[blank.name],
        blank.operations,
        context,
      );
      if (!applied.ok) {
        fullyResolved = false;
        return match;
      }

      filled = true;
      return applied.text;
    },
  );

  return { text, fullyResolved, filled };
}
