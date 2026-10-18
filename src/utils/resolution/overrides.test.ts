import { SECRET_MASK } from "@/common/config";
import { CommandSegmentType, UnresolvedCause } from "@/common/enums";
import type { VariableSpec } from "@/test";
import { buildVariables, runbook, secret, variableValues } from "@/test";
import { describe, expect, it } from "vitest";

import { resolveCommandText } from "./command";
import {
  applyOverrides,
  overriddenSecretKeys,
  overrideLookupMap,
  overrideScope,
  unresolvedOverrideParts,
  withOverride,
} from "./overrides";
import { maskedText } from "./segments";
import { getVariableMap } from "./variables";

/** The embedded runbook's resolved values once `overrides` are applied from `host`. */
function embed(
  embedded: VariableSpec,
  overrides: Record<string, string>,
  host: VariableSpec = {},
) {
  const book = runbook(host);
  const own = buildVariables(embedded);
  const variables = applyOverrides(own, overrides);

  const variableMap = getVariableMap(
    variables,
    overrideScope(variables, overrides, getVariableMap(book.variables)),
  );
  const secretKeys = overriddenSecretKeys(
    own,
    overrides,
    variableMap,
    book.secrets,
  );

  const resolve = (command: string) => resolveCommandText(command, variableMap);

  return {
    values: variableValues(variableMap),
    secretKeys,
    resolve,
    shown: (command: string) =>
      resolve(command)
        .map((segment) => maskedText(segment, secretKeys))
        .join(""),
  };
}

describe("applyOverrides", () => {
  it("replaces the value of the variable holding the key", () => {
    expect(
      embed({ ENV: "dev", HOST: "{ENV}.example.com" }, { ENV: "prod" }).values,
    ).toEqual({ ENV: "prod", HOST: "prod.example.com" });
  });

  it("resolves the value against the host's variables", () => {
    expect(
      embed({ ENV: "dev" }, { ENV: "{STAGE|lowercase}" }, { STAGE: "PROD" })
        .values,
    ).toEqual({ ENV: "prod" });
  });

  it("leaves a reference the host cannot resolve to the embedded runbook", () => {
    expect(
      embed({ ENV: "dev", HOST: "" }, { HOST: "{ENV}.internal" }).values,
    ).toEqual({ ENV: "dev", HOST: "dev.internal" });
  });

  it("prefers the host's variable when both runbooks define the key", () => {
    expect(
      embed(
        { ENV: "dev", HOST: "" },
        { HOST: "{ENV}.internal" },
        { ENV: "prod" },
      ).values,
    ).toEqual({ ENV: "dev", HOST: "prod.internal" });
  });

  it("keeps the host's nesting in the overridden value", () => {
    const host = { B: "hi from {C}", C: "x" };
    const [segment] = embed({ A: "" }, { A: "{B}" }, host).resolve("{A}");

    expect(segment.spans).toEqual([
      { text: "hi from ", depth: 2, source: "B" },
      { text: "x", depth: 3, source: "C" },
    ]);
  });

  it("leaves a reference to an empty host value unresolved", () => {
    const { values, resolve } = embed({ A: "dev" }, { A: "{B}" }, { B: "" });

    expect(values).toEqual({ A: "{B}" });
    expect(resolve("echo {A}")).toEqual([
      { text: "echo ", type: CommandSegmentType.LITERAL },
      {
        key: "A",
        text: "{B}",
        type: CommandSegmentType.RESOLVED,
        spans: [{ text: "{B}", depth: 2, source: "B", unresolved: true }],
      },
    ]);
  });

  it("paints an empty host value inside the rest of the override", () => {
    const { values, resolve } = embed(
      { placeholder: "" },
      { placeholder: "hello {world}" },
      { world: "" },
    );

    expect(values).toEqual({ placeholder: "hello {world}" });
    expect(resolve("{placeholder}")[0].spans).toEqual([
      { text: "hello ", depth: 1, source: "placeholder" },
      { text: "{world}", depth: 2, source: "world", unresolved: true },
    ]);
  });

  it("shows where an override broke a call that reads it", () => {
    const [segment] = embed(
      { condition: "0" },
      { condition: "hi from {missing}" },
    ).resolve("{|IF({condition}; x; y)}");

    expect(segment.type).toBe(CommandSegmentType.UNRESOLVED);
    expect(segment.text).toBe("{|IF(hi from {missing}; x; y)}");
    expect(segment.spans).toEqual([
      { text: "{|IF(", depth: 1, unresolved: true },
      { text: "hi from ", depth: 2, source: "condition" },
      { text: "{missing}", depth: 3, source: "missing", unresolved: true },
      { text: "; x; y)}", depth: 1, unresolved: true },
    ]);
  });

  it("shows what a call that failed was handed", () => {
    const [segment] = embed(
      { condition: "0" },
      { condition: "hi from {missing}" },
      { missing: "my app" },
    ).resolve("{|IF({condition}; x; y)}");

    expect(segment.type).toBe(CommandSegmentType.UNRESOLVED);
    expect(segment.text).toBe("{|IF(hi from my app; x; y)}");
    expect(segment.spans).toEqual([
      { text: "{|IF(", depth: 1, unresolved: true },
      { text: "hi from ", depth: 2, source: "condition" },
      { text: "my app", depth: 3, source: "missing" },
      { text: "; x; y)}", depth: 1, unresolved: true },
    ]);
  });

  it("still answers an operation over an empty host value", () => {
    expect(
      embed({ A: "" }, { A: "{B|isempty} {B|len}" }, { B: "" }).values,
    ).toEqual({ A: "true 0" });
  });

  it("reads an empty host value before the embedded runbook's own", () => {
    expect(
      embed({ A: "", B: "embedded" }, { A: "{B}" }, { B: "" }).values,
    ).toEqual({ A: "{B}", B: "embedded" });
  });

  it("leaves a reference to an empty embedded value unresolved", () => {
    expect(
      embed({ A: "", B: "" }, { A: "x{B}y" }, { C: "host" }).values,
    ).toEqual({ A: "x{B}y", B: "" });
  });

  it("resolves the embedded runbook's own values without the host", () => {
    expect(
      embed({ A: "", HOST: "{ENV}" }, { A: "x" }, { ENV: "prod" }).values,
    ).toEqual({ A: "x", HOST: "{ENV}" });
  });

  it("ignores a key the runbook does not define", () => {
    expect(embed({ HOST: "example.com" }, { REGION: "eu" }).values).toEqual({
      HOST: "example.com",
    });
  });

  it("keeps an overridden secret masked", () => {
    expect(
      embed({ TOKEN: secret("old") }, { TOKEN: "new" }).secretKeys,
    ).toEqual(new Set(["TOKEN"]));
  });

  it.each([
    ["{PASSWORD}", SECRET_MASK],
    ["Bearer {PASSWORD}!", `Bearer ${SECRET_MASK}!`],
    ["1{;a={PASSWORD}}1", `1${SECRET_MASK}1`],
    ["{|IF(true;{PASSWORD};x)}", SECRET_MASK],
    ["{PASSWORD|uppercase}", SECRET_MASK],
    ["{WRAPPED}", `[${SECRET_MASK}]`],
  ])("masks only the host secret inside the override %s", (override, shown) => {
    const host = { PASSWORD: secret("hunter2"), WRAPPED: "[{PASSWORD}]" };

    expect(embed({ AUTH: "" }, { AUTH: override }, host).shown("{AUTH}")).toBe(
      shown,
    );
  });

  it("masks nothing an override does not carry in from a host secret", () => {
    const host = { PASSWORD: secret("hunter2"), USER: "admin" };

    expect(embed({ AUTH: "" }, { AUTH: "{USER}" }, host).secretKeys).toEqual(
      new Set(),
    );
  });

  it("returns the same variables when there is nothing to apply", () => {
    const variables = buildVariables({ ENV: "dev" });
    const secretKeys = new Set<string>();

    expect(applyOverrides(variables, {}, secretKeys)).toBe(variables);
    expect(applyOverrides(variables, undefined, secretKeys)).toBe(variables);
  });

  it("reads no host scope when no override applies", () => {
    const variables = buildVariables({ ENV: "dev" });

    expect(overrideScope(variables, undefined, {})).toBeUndefined();
    expect(overrideScope(variables, { REGION: "eu" }, {})).toBeUndefined();
  });
});

describe("overrideLookupMap", () => {
  it("reads the host first", () => {
    const map = overrideLookupMap(
      buildVariables({ a: "1", b: "embedded" }),
      { a: "{b}" },
      getVariableMap(buildVariables({ b: "host" })),
    );

    expect(variableValues(map)).toMatchObject({ a: "host", b: "host" });
  });
});

describe("unresolvedOverrideParts", () => {
  /** The causes the overrides report. */
  function causesOf(
    embedded: VariableSpec,
    overrides: Record<string, string>,
    host: VariableSpec = {},
  ) {
    return unresolvedOverrideParts(
      buildVariables(embedded),
      overrides,
      getVariableMap(buildVariables(host)),
      new Set(),
    ).map(({ cause, source }) => [cause, source]);
  }

  it("reads a key the embedded runbook defines", () => {
    expect(causesOf({ a: "1", b: "test" }, { a: "{b}" })).toEqual([]);
  });

  it("reads the embedded runbook with its overrides applied", () => {
    expect(causesOf({ a: "1", b: "{NOPE}" }, { a: "{b}", b: "fine" })).toEqual(
      [],
    );
  });

  it("still reports a key neither runbook defines", () => {
    expect(causesOf({ a: "1" }, { a: "{NOPE}" })).toEqual([
      [UnresolvedCause.UNDEFINED, "NOPE"],
    ]);
  });

  it("leaves a blank for whoever references the key to fill", () => {
    expect(
      causesOf({ a: "1", secret: secret("123") }, { a: "b{;b={secret}}b" }),
    ).toEqual([]);
    expect(causesOf({ a: "1" }, { a: "b{;b}b" })).toEqual([]);
  });

  it("ignores an override of a key the embedded runbook dropped", () => {
    expect(causesOf({ a: "1" }, { gone: "{NOPE}" })).toEqual([]);
  });
});

describe("withOverride", () => {
  it("sets a value that differs from the runbook's own", () => {
    expect(withOverride({ A: "1" }, "B", "2", "0")).toEqual({ A: "1", B: "2" });
  });

  it("drops the key once the value is back to the runbook's own", () => {
    expect(withOverride({ A: "1", B: "2" }, "B", "0", "0")).toEqual({ A: "1" });
  });

  it("is undefined once nothing is overridden", () => {
    expect(withOverride({ B: "2" }, "B", "0", "0")).toBeUndefined();
    expect(withOverride(undefined, "B", "0", "0")).toBeUndefined();
  });
});
