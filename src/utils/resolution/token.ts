import { EscapedBraceRegex, VariableSyntax } from "@/common/config";

export function unescapeBraces(text: string): string {
  return text.replace(EscapedBraceRegex, "$1");
}

export function braceToken(raw: string): string {
  return `${VariableSyntax.BRACE_OPEN}${raw}${VariableSyntax.BRACE_CLOSE}`;
}

interface TokenOperations {
  base: string;
  operations: string[];
}

/** Splits `KEY;params|op|op` into its base and its operations. */
export function splitTokenOperations(raw: string): TokenOperations {
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

export function getTokenKey(raw: string): string {
  return splitTokenOperations(raw)
    .base.split(VariableSyntax.PARAM_SEPARATOR)[0]
    .trim();
}
