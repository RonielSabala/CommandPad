import {
  NumberArgumentRegex,
  NumberTermRegex,
  TokenWhitespaceRegex,
} from "@/common/variableSyntax";

type NumberArgument = number | null;

function readNumberArgument(raw: string): NumberArgument | undefined {
  if (!NumberArgumentRegex.test(raw)) {
    return undefined;
  }

  const text = raw.replace(TokenWhitespaceRegex, "");
  if (!text) {
    return null;
  }

  let total = 0;
  for (const [term] of text.matchAll(NumberTermRegex)) {
    total += Number(term);
  }

  return total;
}

export function readNumberArguments(
  args: readonly string[],
): NumberArgument[] | null {
  const numbers: NumberArgument[] = [];

  for (const arg of args) {
    const value = readNumberArgument(arg);
    if (value === undefined) {
      return null;
    }

    numbers.push(value);
  }

  return numbers;
}
