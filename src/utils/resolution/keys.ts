import { ExtractedVariableConfig, StringCaseConfig } from "@/common/config";
import { splitWords } from "@/utils/stringCase";

/** Where a key that is already taken starts counting. */
const FIRST_SUFFIX = 1;

export function uniqueVariableKey(
  base: string,
  takenKeys: ReadonlySet<string>,
): string {
  let candidate = base;
  let counter = FIRST_SUFFIX;

  while (takenKeys.has(candidate)) {
    candidate = `${base}${counter}`;
    counter += 1;
  }

  return candidate;
}

/** The key a value extracted from a command starts life with. */
export function extractedVariableKey(
  value: string,
  takenKeys: ReadonlySet<string>,
): string {
  const derived = splitWords(value)
    .slice(0, ExtractedVariableConfig.MAX_KEY_WORDS)
    .join(StringCaseConfig.SNAKE_SEPARATOR)
    .toUpperCase();

  const hasLetter = derived.toLowerCase() !== derived.toUpperCase();
  const base =
    hasLetter && derived.length <= ExtractedVariableConfig.MAX_KEY_LENGTH
      ? derived
      : ExtractedVariableConfig.DEFAULT_KEY;

  return uniqueVariableKey(base, takenKeys);
}
