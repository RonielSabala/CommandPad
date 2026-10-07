import {
  CalcGroup,
  CalcSyntax,
  CalcTokenRegex,
  NumberValueRegex,
  RoundSyntax,
} from "@/common/variableSyntax";
import { isNumber } from "@/utils/typeGuards";

type CalcToken = number | string;

function tokenize(expression: string): CalcToken[] | undefined {
  const tokens: CalcToken[] = [];

  for (const match of expression.matchAll(CalcTokenRegex)) {
    const groups = match.groups ?? {};
    if (groups[CalcGroup.INVALID] !== undefined) {
      return undefined;
    }

    if (groups[CalcGroup.NUMBER] !== undefined) {
      tokens.push(Number(groups[CalcGroup.NUMBER]));
    } else if (groups[CalcGroup.SYMBOL] !== undefined) {
      tokens.push(groups[CalcGroup.SYMBOL]);
    }
  }

  return tokens;
}

const BINARY: Record<string, ((a: number, b: number) => number) | undefined> = {
  [CalcSyntax.PLUS]: (a, b) => a + b,
  [CalcSyntax.MINUS]: (a, b) => a - b,
  [CalcSyntax.MULTIPLY]: (a, b) => a * b,
  [CalcSyntax.DIVIDE]: (a, b) => a / b,
  [CalcSyntax.MODULO]: (a, b) => ((a % b) + b) % b,
};

const ADDITIVE: readonly CalcToken[] = [CalcSyntax.PLUS, CalcSyntax.MINUS];
const MULTIPLICATIVE: readonly CalcToken[] = [
  CalcSyntax.MULTIPLY,
  CalcSyntax.DIVIDE,
  CalcSyntax.MODULO,
];

/**
 * Evaluates `+ - * / %` over numbers and parentheses, with the usual precedence
 * and left-to-right associativity. Returns `undefined` for anything malformed and
 * for a result that is not a finite number.
 */
export function evaluateArithmetic(expression: string): number | undefined {
  const tokens = tokenize(expression);
  if (!tokens) {
    return undefined;
  }

  let position = 0;

  const binary = (
    operators: readonly CalcToken[],
    operand: () => number | undefined,
  ): number | undefined => {
    let left = operand();

    while (left !== undefined && operators.includes(tokens[position])) {
      const apply = BINARY[tokens[position] as string];
      position += 1;

      const right = operand();
      left = apply && right !== undefined ? apply(left, right) : undefined;
    }

    return left;
  };

  const sum = (): number | undefined => binary(ADDITIVE, product);
  const product = (): number | undefined => binary(MULTIPLICATIVE, unary);

  const unary = (): number | undefined => {
    const token = tokens[position];
    if (ADDITIVE.includes(token)) {
      position += 1;

      const value = unary();
      return value === undefined || token === CalcSyntax.PLUS ? value : -value;
    }

    return primary();
  };

  const primary = (): number | undefined => {
    const token = tokens[position];
    position += 1;

    if (isNumber(token)) {
      return token;
    }

    if (token !== CalcSyntax.GROUP_OPEN) {
      return undefined;
    }

    const value = sum();
    if (tokens[position] !== CalcSyntax.GROUP_CLOSE) {
      return undefined;
    }

    position += 1;
    return value;
  };

  const result = sum();
  if (result === undefined || position !== tokens.length) {
    return undefined;
  }

  return Number.isFinite(result) ? result : undefined;
}

export function formatArithmetic(value: number): string {
  return String(Number(value.toPrecision(CalcSyntax.PRECISION)) || 0);
}

export function parseNumber(text: string): number | undefined {
  const trimmed = text.trim();
  return NumberValueRegex.test(trimmed) ? Number(trimmed) : undefined;
}

/**
 * Moves the decimal point by `places` through the exponent, so the digits are
 * never multiplied.
 */
function shiftDecimal(value: number, places: number): number {
  const [mantissa, exponent = "0"] = String(value).split(RoundSyntax.EXPONENT);
  return Number(
    `${mantissa}${RoundSyntax.EXPONENT}${Number(exponent) + places}`,
  );
}

export function roundToDigits(
  value: number,
  digits: number,
  round: (value: number) => number,
): number {
  return shiftDecimal(round(shiftDecimal(value, digits)), -digits);
}
