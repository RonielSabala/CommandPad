import { VariableSyntax } from "@/common/variableSyntax";
import { buildVariables, commandBlock } from "@/test";
import { describe, expect, it } from "vitest";

import { carryVariables, uniqueCopyKey } from "./carry";

const COPY = `HOST${VariableSyntax.COPY_SUFFIX}`;

describe("uniqueCopyKey", () => {
  it("suffixes the key", () => {
    expect(uniqueCopyKey("HOST", new Set())).toBe(COPY);
  });

  it("counts up while the suffixed key is taken", () => {
    expect(uniqueCopyKey("HOST", new Set([COPY]))).toBe(`${COPY}1`);
    expect(uniqueCopyKey("HOST", new Set([COPY, `${COPY}1`]))).toBe(`${COPY}2`);
  });

  it("strips an existing suffix, so copying a copy does not stack them", () => {
    expect(uniqueCopyKey(`${COPY}2`, new Set())).toBe(COPY);
  });
});

describe("carryVariables", () => {
  const blocks = [commandBlock("ssh {USER}@{HOST}")];
  const source = buildVariables({
    HOST: "example.com",
    USER: "root",
    UNUSED: "nobody references me",
  });

  function keysOf(variables: { key: string; value: string }[]) {
    return variables.map(({ key, value }) => [key, value]);
  }

  it("carries only the variables the blocks actually use", () => {
    const carried = carryVariables(blocks, source, []);

    expect(keysOf(carried.variables)).toEqual([
      ["HOST", "example.com"],
      ["USER", "root"],
    ]);
    expect(carried.renames.size).toBe(0);
  });

  it("gives each carried variable a fresh id", () => {
    const carried = carryVariables(blocks, source, []);
    const sourceIds = source.map((variable) => variable.id);

    for (const variable of carried.variables) {
      expect(sourceIds).not.toContain(variable.id);
    }
  });

  it("carries nothing when the target already defines the same variable", () => {
    const target = buildVariables({ HOST: "example.com", USER: "root" });
    expect(carryVariables(blocks, source, target).variables).toEqual([]);
  });

  it("renames a key the target defines differently", () => {
    const target = buildVariables({ HOST: "other.example", USER: "root" });
    const carried = carryVariables(blocks, source, target);

    expect(keysOf(carried.variables)).toEqual([[COPY, "example.com"]]);
    expect([...carried.renames]).toEqual([["HOST", COPY]]);
  });

  it("rewrites a carried value that references a renamed key", () => {
    const referencing = buildVariables({
      HOST: "example.com",
      URL: "https://{HOST}",
    });
    const target = buildVariables({ HOST: "other.example" });
    const carried = carryVariables(
      [commandBlock("curl {URL}")],
      referencing,
      target,
    );

    expect(keysOf(carried.variables)).toEqual([
      [COPY, "example.com"],
      ["URL", `https://{${COPY}}`],
    ]);
  });

  it("treats a differing secret flag as a different definition", () => {
    const secretSource = buildVariables({ HOST: "example.com" });
    const target = [
      { id: "target-1", key: "HOST", value: "example.com", secret: true },
    ];

    expect(
      keysOf(carryVariables(blocks, secretSource, target).variables),
    ).toEqual([[COPY, "example.com"]]);
  });
});
