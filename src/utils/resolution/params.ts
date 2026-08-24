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

  for (const match of template.matchAll(VariableParamPlaceholderRegex)) {
    const blank = parseBlank(match[1]);
    if (blank) {
      blanks.push({
        blank,
        start: match.index,
        end: match.index + match[0].length,
      });
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
  let fullyResolved = true;
  let filled = false;
  let text = "";
  let lastEnd = 0;

  for (const { blank, start, end } of blanks) {
    text += template.slice(lastEnd, start);
    lastEnd = end;

    const value =
      blank.name in params ? params[blank.name] : defaults[blank.name];
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
