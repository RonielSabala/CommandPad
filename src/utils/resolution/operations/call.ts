import {
  CallGroup,
  CallOperationRegex,
  CallSyntax,
} from "@/common/variableSyntax";

import type { OperationDefinition, OperationTransform } from "./types";

/**
 * Builds the transform behind one spelling of a call, or returns `null` when the
 * arguments are malformed. An empty list means the call was written without arguments.
 */
export type CallBuilder = (
  args: readonly string[],
) => OperationTransform | null;

export interface CallOperationSpec {
  /** How many arguments the call takes. */
  arity: number;
  /** Every keyword the call answers to, mapped to what that spelling builds. */
  builders: Record<string, CallBuilder | undefined>;
}

function splitArguments(raw: string, arity: number): string[] {
  const args: string[] = [];
  let start = 0;

  for (let i = 0; i < raw.length && args.length < arity - 1; i += 1) {
    if (raw[i] === CallSyntax.ARGUMENT_SEPARATOR) {
      args.push(raw.slice(start, i));
      start = i + 1;
    }
  }

  args.push(raw.slice(start));
  return args;
}

export function defineCallOperation(
  spec: CallOperationSpec,
): OperationDefinition {
  return {
    parse: (operation) => {
      const groups = CallOperationRegex.exec(operation)?.groups;
      const build = groups && spec.builders[groups[CallGroup.KEYWORD]];
      if (!build) {
        return null;
      }

      const raw = groups[CallGroup.ARGUMENTS];
      return build(raw ? splitArguments(raw, spec.arity) : []);
    },
  };
}
