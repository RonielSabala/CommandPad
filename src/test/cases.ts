import { describe, expect, it } from "vitest";

import type { VariableSpec } from "./runbook";
import { runbook } from "./runbook";

/**
 * The expectation for a reference that does not resolve: it renders exactly as
 * written.
 */
export const RAW = Symbol("raw");

export type Expected = string | typeof RAW;

/** One command and what resolving it should produce. */
export type ResolutionCase = readonly [command: string, expected: Expected];

interface ResolutionSpec {
  variables?: VariableSpec;
  cases: readonly ResolutionCase[];
}

function label(expected: Expected): string {
  return expected === RAW ? "renders raw" : JSON.stringify(expected);
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

        expect(book.resolve(command)).toBe(expected);
        expect(book.hasUnresolved(command)).toBe(false);
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
