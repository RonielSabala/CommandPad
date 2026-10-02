import type { VariableSpec } from "@/test";
import { buildVariables, runbook, secret, variableValues } from "@/test";
import { describe, expect, it } from "vitest";

import { applyOverrides, withOverride } from "./overrides";
import { getSecretKeys, getVariableMap } from "./variables";

/** The embedded runbook's resolved values once `overrides` are applied from `host`. */
function embed(
  embedded: VariableSpec,
  overrides: Record<string, string>,
  host: VariableSpec = {},
) {
  const book = runbook(host);
  const variables = applyOverrides(buildVariables(embedded), overrides, {
    variableMap: getVariableMap(book.variables),
    secretKeys: book.secrets,
  });

  return {
    variables,
    values: variableValues(getVariableMap(variables)),
    secrets: getSecretKeys(variables),
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

  it("ignores a key the runbook does not define", () => {
    expect(embed({ HOST: "example.com" }, { REGION: "eu" }).values).toEqual({
      HOST: "example.com",
    });
  });

  it("keeps an overridden secret masked", () => {
    expect(embed({ TOKEN: secret("old") }, { TOKEN: "new" }).secrets).toEqual(
      new Set(["TOKEN"]),
    );
  });

  it("masks an override built from a host secret, at any depth", () => {
    const host = { PASSWORD: secret("hunter2") };

    expect(embed({ AUTH: "" }, { AUTH: "{PASSWORD}" }, host).secrets).toEqual(
      new Set(["AUTH"]),
    );
    expect(
      embed({ AUTH: "" }, { AUTH: "{|IF(true;{PASSWORD};x)}" }, host).secrets,
    ).toEqual(new Set(["AUTH"]));
  });

  it("returns the same variables when there is nothing to apply", () => {
    const variables = buildVariables({ ENV: "dev" });
    const host = { variableMap: {}, secretKeys: new Set<string>() };

    expect(applyOverrides(variables, {}, host)).toBe(variables);
    expect(applyOverrides(variables, undefined, host)).toBe(variables);
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
