import { HashOperationRegex, OperationSyntax } from "@/common/variableSyntax";
import { sha256 } from "@/utils/hash";

import { bareKeywords, type OperationDefinition } from "./types";

export const HASH_OPERATION: OperationDefinition = {
  keywords: bareKeywords([OperationSyntax.HASH]),
  parse: (operation) =>
    HashOperationRegex.test(operation.text.trim()) ? sha256 : null,
};
