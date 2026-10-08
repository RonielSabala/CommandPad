import { CommandSegmentType } from "@/common/enums";
import type { VariableSpec } from "@/test";
import { buildVariables, runbook, secret, variableValues } from "@/test";
import { describe, expect, it } from "vitest";

import { resolveCommandText } from "./command";
import { applyOverrides, overrideScope, withOverride } from "./overrides";
import { getSecretKeys, getVariableMap } from "./variables";

/** The embedded runbook's resolved values once `overrides` are applied from `host`. */
function embed(
  embedded: VariableSpec,
  overrides: Record<string, string>,
  host: VariableSpec = {},
) {
  const book = runbook(host);
  const variables = applyOverrides(
    buildVariables(embedded),
    overrides,
    book.secrets,
  );
  const variableMap = getVariableMap(
    variables,
    overrideScope(variables, overrides, getVariableMap(book.variables)),
  );

  return {
    values: variableValues(variableMap),
    secretKeys: getSecretKeys(variables),
    resolve: (command: string) => resolveCommandText(command, variableMap),
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
        spans: [{ text: "{B}", depth: 2, unresolved: true }],
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
      { text: "{world}", depth: 2, unresolved: true },
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

  it("masks an override built from a host secret, at any depth", () => {
    const host = { PASSWORD: secret("hunter2") };

    expect(
      embed({ AUTH: "" }, { AUTH: "{PASSWORD}" }, host).secretKeys,
    ).toEqual(new Set(["AUTH"]));

    expect(
      embed({ AUTH: "" }, { AUTH: "{|IF(true;{PASSWORD};x)}" }, host)
        .secretKeys,
    ).toEqual(new Set(["AUTH"]));
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
