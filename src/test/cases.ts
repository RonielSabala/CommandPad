import { isString } from "@/utils/typeGuards";
import { describe, expect, it } from "vitest";

import type { VariableSpec } from "./runbook";
import { runbook } from "./runbook";

/**
 * The expectation for a reference that does not resolve: it renders exactly as
 * written.
 */
export const RAW = Symbol("raw");

/**
 * The expectation for a command that resolves while a reference nested inside it
 * stayed raw.
 */
const PARTIAL = Symbol("partial");

interface PartialExpectation {
  [PARTIAL]: true;
  text: string;
}

export function partial(text: string): PartialExpectation {
  return { [PARTIAL]: true, text };
}

export type Expected = string | typeof RAW | PartialExpectation;

/** One command and what resolving it should produce. */
export type ResolutionCase = readonly [command: string, expected: Expected];

interface ResolutionSpec {
  variables?: VariableSpec;
  cases: readonly ResolutionCase[];
}

function label(expected: Expected): string {
  if (expected === RAW) {
    return "renders raw";
  }

  return isString(expected)
    ? JSON.stringify(expected)
    : `${JSON.stringify(expected.text)} with a raw reference`;
}

/** Declares one test per command, all against the same variables. */
export function checkResolution(title: string, spec: ResolutionSpec): void {
  describe(title, () => {
    const book = runbook(spec.variables);

    for (const [command, expected] of spec.cases) {
      it(`${command} -> ${label(expected)}`, () => {
        if (expected === RAW) {
          expect(book.resolve(command)).toBe(command);
          expect(book.hasUnresolved(command)).toBe(true);
          return;
        }

        const partially = !isString(expected);
        expect(book.resolve(command)).toBe(
          partially ? expected.text : expected,
        );
        expect(book.hasUnresolved(command)).toBe(partially);
      });
    }
  });
}

interface ValuesSpec {
  variables: VariableSpec;
  expected: Record<string, string>;
}

/**
 * Declares one test per variable, asserting what its value resolves to against
 * its neighbours.
 */
export function checkValues(title: string, spec: ValuesSpec): void {
  describe(title, () => {
    const book = runbook(spec.variables);

    for (const [key, expected] of Object.entries(spec.expected)) {
      it(`${key} -> ${JSON.stringify(expected)}`, () => {
        expect(book.values[key]).toBe(expected);
      });
    }
  });
}
