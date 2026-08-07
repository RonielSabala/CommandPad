import {
  StripGroup,
  StripOperationRegex,
  StripSyntax,
} from "@/common/variableSyntax";
import { stripBoth, stripEnd, stripStart } from "@/utils/string";

import type { OperationDefinition } from "./types";

interface StripBehavior {
  trim: (text: string) => string;
  cut: (text: string, cut: string) => string;
}

const STRIP_BEHAVIORS: Record<string, StripBehavior | undefined> = {
  [StripSyntax.BOTH]: { trim: (text) => text.trim(), cut: stripBoth },
  [StripSyntax.LEFT]: { trim: (text) => text.trimStart(), cut: stripStart },
  [StripSyntax.RIGHT]: { trim: (text) => text.trimEnd(), cut: stripEnd },
};

export const STRIP_OPERATION: OperationDefinition = {
  parse: (operation) => {
    const groups = StripOperationRegex.exec(operation.trim())?.groups;
    const behavior = groups && STRIP_BEHAVIORS[groups[StripGroup.KEYWORD]];
    if (!behavior) {
      return null;
    }

    const argument = groups[StripGroup.ARGUMENT];
    return argument
      ? (text) => behavior.cut(text, argument)
      : (text) => behavior.trim(text);
  },
};
