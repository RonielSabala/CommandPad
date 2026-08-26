import { BooleanSyntax } from "@/common/variableSyntax";

const BOOLEAN_VALUES: Record<string, boolean | undefined> = {
  [BooleanSyntax.TRUE]: true,
  [BooleanSyntax.TRUE_ALT]: true,
  [BooleanSyntax.FALSE]: false,
  [BooleanSyntax.FALSE_ALT]: false,
};

export function readBoolean(raw: string): boolean | undefined {
  return BOOLEAN_VALUES[raw.trim().toLowerCase()];
}

export function readBooleans(args: readonly string[]): boolean[] | null {
  const values: boolean[] = [];

  for (const arg of args) {
    const value = readBoolean(arg);
    if (value === undefined) {
      return null;
    }

    values.push(value);
  }

  return values;
}

export function writeBoolean(value: boolean): string {
  return value ? BooleanSyntax.TRUE : BooleanSyntax.FALSE;
}
