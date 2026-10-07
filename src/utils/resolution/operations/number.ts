import { evaluateArithmetic } from "@/utils/arithmetic";

type NumberArgument = number | null;

export function readNumberArgument(raw: string): NumberArgument | undefined {
  if (!raw.trim()) {
    return null;
  }

  const value = evaluateArithmetic(raw);
  return value !== undefined && Number.isInteger(value) ? value : undefined;
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
