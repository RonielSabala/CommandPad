import { CaseSyntax } from "@/common/variableSyntax";
import {
  capitalizeText,
  swapCase,
  toCamelCase,
  toKebabCase,
  toPascalCase,
  toSnakeCase,
  toTitleCase,
} from "@/utils/stringCase";

import type { OperationDefinition, OperationTransform } from "./types";

const CASE_TRANSFORMS: Record<string, OperationTransform | undefined> = {
  [CaseSyntax.SNAKE]: toSnakeCase,
  [CaseSyntax.KEBAB]: toKebabCase,
  [CaseSyntax.CAMEL]: toCamelCase,
  [CaseSyntax.PASCAL]: toPascalCase,
  [CaseSyntax.CAPITALIZE]: capitalizeText,
  [CaseSyntax.TITLE]: toTitleCase,
  [CaseSyntax.LOWER]: (text) => text.toLowerCase(),
  [CaseSyntax.UPPER]: (text) => text.toUpperCase(),
  [CaseSyntax.SWAP]: swapCase,
};

export const CASE_OPERATION: OperationDefinition = {
  parse: (operation) => CASE_TRANSFORMS[operation.trim()] ?? null,
};
