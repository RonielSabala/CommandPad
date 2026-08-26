import { MatchSyntax } from "@/common/variableSyntax";

import { writeBoolean } from "./boolean";
import { defineCallOperation, type CallBuilder } from "./call";
import type { OperationDefinition } from "./types";

type Matcher = (text: string, candidate: string) => boolean;

function matchBuilder(matches: Matcher): CallBuilder {
  return (args) => {
    const candidates = args.map((arg) => arg.trim()).filter(Boolean);
    return candidates.length === 0
      ? null
      : (text) =>
          writeBoolean(
            candidates.some((candidate) => matches(text, candidate)),
          );
  };
}

export const MATCH_OPERATION: OperationDefinition = defineCallOperation({
  arity: MatchSyntax.ARITY,
  builders: {
    [MatchSyntax.STARTS_WITH]: matchBuilder((text, candidate) =>
      text.startsWith(candidate),
    ),
    [MatchSyntax.ENDS_WITH]: matchBuilder((text, candidate) =>
      text.endsWith(candidate),
    ),
    [MatchSyntax.CONTAINS]: matchBuilder((text, candidate) =>
      text.includes(candidate),
    ),
  },
});
