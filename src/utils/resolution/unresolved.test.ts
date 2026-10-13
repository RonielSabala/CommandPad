import { SECRET_MASK } from "@/common/config";
import { UnresolvedCause } from "@/common/enums";
import { buildVariables, secret, type VariableSpec } from "@/test";
import { describe, expect, it } from "vitest";

import { unresolvedParts, type UnresolvedPart } from "./unresolved";
import { getSecretKeys, getVariableMap } from "./variables";

function partsOf(spec: VariableSpec, command: string): UnresolvedPart[] {
  const variables = buildVariables(spec);
  return unresolvedParts(
    command,
    getVariableMap(variables),
    getSecretKeys(variables),
  );
}

const SPEC: VariableSpec = {
  HOST: "example.com",
  EMPTY: "",
  PORT: "5",
  INNER: "{NOPE}",
  OUTER: "{INNER|uppercase}",
  TEMPLATE: "x{;p}",
  TOKEN: secret("s3cr3t"),
};

describe("unresolvedParts", () => {
  it.each<[string, UnresolvedPart[]]>([
    ["ssh {HOST}", []],
    [
      "{NOPE}",
      [{ cause: UnresolvedCause.UNDEFINED, source: "NOPE", text: "{NOPE}" }],
    ],
    [
      "{NOPE|uppercase}",
      [
        {
          cause: UnresolvedCause.UNDEFINED,
          source: "NOPE",
          text: "{NOPE|uppercase}",
        },
      ],
    ],
    [
      "{EMPTY}",
      [{ cause: UnresolvedCause.EMPTY, source: "EMPTY", text: "{EMPTY}" }],
    ],
    [
      "{TEMPLATE}",
      [{ cause: UnresolvedCause.BLANK, source: "TEMPLATE;p", text: "{;p}" }],
    ],
    [
      "{PORT|round(a)}",
      [
        {
          cause: UnresolvedCause.FAILED,
          source: "PORT",
          text: "{PORT|round(a)}",
        },
      ],
    ],
    [
      "{|calc(1 + 2)|round(a)}",
      [{ cause: UnresolvedCause.FAILED, source: "", text: "{3|round(a)}" }],
    ],
  ])("%s", (command, expected) => {
    expect(partsOf(SPEC, command)).toEqual(expected);
  });

  it("reports what a failing reference holds, not the reference", () => {
    for (const command of ["{INNER|uppercase}", "{OUTER}", "{PORT;x={NOPE}}"]) {
      expect(partsOf(SPEC, command)).toEqual([
        { cause: UnresolvedCause.UNDEFINED, source: "NOPE", text: "{NOPE}" },
      ]);
    }

    expect(partsOf(SPEC, "{TEMPLATE|uppercase}")).toEqual([
      { cause: UnresolvedCause.BLANK, source: "TEMPLATE;p", text: "{;p}" },
    ]);
  });

  it("reports every failing reference of a command", () => {
    expect(partsOf(SPEC, "{NOPE} {EMPTY}").map((part) => part.source)).toEqual([
      "NOPE",
      "EMPTY",
    ]);
  });

  it("masks a secret that resolved inside a failing reference", () => {
    expect(partsOf(SPEC, "{TOKEN|uppercase|round(a)}")).toEqual([
      {
        cause: UnresolvedCause.FAILED,
        source: "TOKEN",
        text: `{${SECRET_MASK}|round(a)}`,
      },
    ]);
  });
});
