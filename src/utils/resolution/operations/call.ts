import type { ResolvedSpan } from "@/common/types";
import {
  CallGroup,
  CallOperationRegex,
  CallSyntax,
} from "@/common/variableSyntax";

import { sliceSpans } from "../spans";
import type { OperationDefinition, OperationTransform } from "./types";

/** The spans of the argument at `index`. */
export type ArgumentSpans = (index: number) => ResolvedSpan[];

/**
 * Builds the transform behind one spelling of a call, or returns `null` when the
 * arguments are malformed. An empty list means the call was written without arguments.
 */
export type CallBuilder = (
  args: readonly string[],
  argumentSpans: ArgumentSpans,
) => OperationTransform | null;

export interface CallOperationSpec {
  /** How many arguments the call takes. */
  arity: number;
  /** Every keyword the call answers to, mapped to what that spelling builds. */
  builders: Record<string, CallBuilder | undefined>;
}

/** One argument, and where it begins inside the arguments it was split from. */
interface CallArgument {
  text: string;
  start: number;
}

function splitArguments(raw: string, arity: number): CallArgument[] {
  const args: CallArgument[] = [];
  let start = 0;

  for (let i = 0; i < raw.length && args.length < arity - 1; i += 1) {
    if (raw[i] === CallSyntax.ARGUMENT_SEPARATOR) {
      args.push({ text: raw.slice(start, i), start });
      start = i + 1;
    }
  }

  args.push({ text: raw.slice(start), start });
  return args;
}

export function defineCallOperation(
  spec: CallOperationSpec,
): OperationDefinition {
  return {
    keywords: Object.keys(spec.builders).map((keyword) => ({
      keyword,
      arity: spec.arity,
    })),
    parse: (operation) => {
      const groups = CallOperationRegex.exec(operation.text)?.groups;
      const build = groups && spec.builders[groups[CallGroup.KEYWORD]];
      if (!build) {
        return null;
      }

      const raw = groups[CallGroup.ARGUMENTS];
      const args = raw ? splitArguments(raw, spec.arity) : [];

      const offset =
        operation.text.indexOf(CallSyntax.ARGUMENT_OPEN) +
        CallSyntax.ARGUMENT_OPEN.length;
      const spans = operation.spans ?? [];

      const argumentSpans: ArgumentSpans = (index) => {
        const arg = args[index];
        return arg
          ? sliceSpans(
              spans,
              offset + arg.start,
              offset + arg.start + arg.text.length,
            )
          : [];
      };

      return build(
        args.map((arg) => arg.text),
        argumentSpans,
      );
    },
  };
}
