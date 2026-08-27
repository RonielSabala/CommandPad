import { describe, expect, it } from "vitest";

import {
  renameAllCommandTokens,
  renameAllValueTokens,
  renameCommandTokens,
  renameValueTokens,
} from "./rename";

describe("renameCommandTokens", () => {
  it.each([
    ["ssh {USER}@{HOST}", "ssh {USER}@{SERVER}"],
    ["{HOST|uppercase}", "{SERVER|uppercase}"],
    ["{A;target={HOST}}", "{A;target={SERVER}}"],
    ["{A|slice({HOST|len};)}", "{A|slice({SERVER|len};)}"],
    ["{HOST} and {HOST}", "{SERVER} and {SERVER}"],
  ])("%s -> %s", (text, expected) => {
    expect(renameCommandTokens(text, "HOST", "SERVER")).toBe(expected);
  });

  it("keeps the layout the reference was written in", () => {
    expect(
      renameCommandTokens("{ HOST ; a = b | len }", "HOST", "SERVER"),
    ).toBe("{ SERVER ; a = b | len }");
  });

  it("renames only the key, never a param or an operation that spells it", () => {
    expect(renameCommandTokens("{A;HOST=HOST}", "HOST", "SERVER")).toBe(
      "{A;HOST=HOST}",
    );
  });

  it("leaves a key that only starts the same alone", () => {
    expect(renameCommandTokens("{HOSTNAME}", "HOST", "SERVER")).toBe(
      "{HOSTNAME}",
    );
  });

  it("skips an escaped reference, which renders literally", () => {
    expect(
      renameCommandTokens(String.raw`\{HOST} {HOST}`, "HOST", "SERVER"),
    ).toBe(String.raw`\{HOST} {SERVER}`);
  });

  it("is a no-op without an old key", () => {
    expect(renameCommandTokens("{HOST}", "", "SERVER")).toBe("{HOST}");
  });
});

describe("renameValueTokens", () => {
  it("renames an escaped reference too, since a value has no escaping", () => {
    expect(renameValueTokens(String.raw`\{HOST}`, "HOST", "SERVER")).toBe(
      String.raw`\{SERVER}`,
    );
  });
});

describe("renaming several keys at once", () => {
  const renames = new Map([
    ["HOST", "SERVER"],
    ["USER", "ACCOUNT"],
  ]);

  it("rewrites command text", () => {
    expect(renameAllCommandTokens("ssh {USER}@{HOST}", renames)).toBe(
      "ssh {ACCOUNT}@{SERVER}",
    );
  });

  it("rewrites a variable value", () => {
    expect(renameAllValueTokens("{USER}:{HOST}", renames)).toBe(
      "{ACCOUNT}:{SERVER}",
    );
  });

  it("is a no-op with nothing to rename", () => {
    expect(renameAllCommandTokens("{HOST}", new Map())).toBe("{HOST}");
  });
});
