import type { Variable } from "@/common/types";
import { checkValues, runbook, secret } from "@/test";
import { describe, expect, it } from "vitest";

import {
  getSecretKeys,
  getVariableKey,
  getVariableMap,
  isConstantVariableKey,
} from "./variables";

function variable(key: string, value: string): Variable {
  return { id: `${key}-${value}`, key, value };
}

describe("getVariableKey", () => {
  it("trims the key", () => {
    expect(getVariableKey(variable("  HOST  ", ""))).toBe("HOST");
  });

  it("keeps a key's interior spaces", () => {
    expect(getVariableKey(variable(" MY VAR ", ""))).toBe("MY VAR");
  });
});

describe("isConstantVariableKey", () => {
  it.each([
    ["HOST", true],
    ["MY_VAR", true],
    ["Host", false],
    ["host", false],
    ["1234", false],
  ])("%s -> %s", (key, expected) => {
    expect(isConstantVariableKey(key)).toBe(expected);
  });
});

checkValues("a value resolves against its neighbours", {
  variables: {
    HOST: "example.com",
    PORT: "8080",
    ORIGIN: "https://{HOST}:{PORT}",
    HEALTH: "{ORIGIN}/health",
  },
  expected: {
    ORIGIN: "https://example.com:8080",
    HEALTH: "https://example.com:8080/health",
  },
});

describe("getVariableMap", () => {
  it("skips a variable with no key", () => {
    expect(getVariableMap([variable("  ", "orphan")])).toEqual({});
  });

  it("keys by the trimmed key", () => {
    expect(getVariableMap([variable("  HOST  ", "example.com")])).toEqual({
      HOST: "example.com",
    });
  });

  it("lets the last of two duplicate keys win", () => {
    expect(
      getVariableMap([variable("HOST", "first"), variable("HOST", "second")]),
    ).toEqual({ HOST: "second" });
  });

  it("defaults to an empty map", () => {
    expect(getVariableMap()).toEqual({});
  });
});

checkValues("a reference loop leaves every key in it raw", {
  variables: {
    SELF: "{SELF}",
    A: "{B}",
    B: "{A}",
    SAFE: "fine",
  },
  expected: {
    SELF: "{SELF}",
    A: "{B}",
    B: "{A}",
    SAFE: "fine",
  },
});

describe("a key whose value looped is refused rather than transformed", () => {
  const book = runbook({ X: "{Y|uppercase}", Y: "{X}" });

  it("does not slice the raw text of a reference that never resolved", () => {
    expect(book.values.X).toBe("{Y|uppercase}");
  });
});

describe("getSecretKeys", () => {
  it("collects the keys of the variables marked secret", () => {
    const book = runbook({
      HOST: "example.com",
      TOKEN: secret("s3cr3t"),
      PASSWORD: secret("hunter2"),
    });

    expect([...book.secrets].sort()).toEqual(["PASSWORD", "TOKEN"]);
  });

  it("ignores a secret with no key", () => {
    expect(
      getSecretKeys([{ id: "1", key: "  ", value: "x", secret: true }]),
    ).toEqual(new Set());
  });

  it("defaults to an empty set", () => {
    expect(getSecretKeys()).toEqual(new Set());
  });
});
