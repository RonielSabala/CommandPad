import { runbook, secret } from "@/test";
import { describe, expect, it } from "vitest";

import { inlineReferences } from "./inline";

describe("inlineReferences", () => {
  const { variables } = runbook({
    X: "dummy",
    HOST: "{USER}@example.com",
    USER: "admin",
    NAME: "web",
    PATH: "srv/{;app}/logs",
    TOKEN: secret("s3cr3t"),
    AUTH: "Bearer {TOKEN}",
    EMPTY: "",
  });

  const inline = (text: string) => inlineReferences(text, variables);

  it("writes a variable's value in place of its reference", () => {
    expect(inline("hello {X}")).toBe("hello dummy");
  });

  it("keeps the references inside a bare reference's value live", () => {
    expect(inline("ssh {HOST}")).toBe("ssh {USER}@example.com");
  });

  it("writes what a reference with operations resolves to", () => {
    expect(inline("{NAME|uppercase}")).toBe("WEB");
  });

  it("writes what a reference filling blanks resolves to", () => {
    expect(inline("tail {PATH;app=api}")).toBe("tail srv/api/logs");
  });

  it("inlines every reference in the text", () => {
    expect(inline("{X} and {NAME}")).toBe("dummy and web");
  });

  it("leaves a reference that does not resolve as written", () => {
    expect(inline("{MISSING} {EMPTY} {X}")).toBe("{MISSING} {EMPTY} dummy");
  });

  it("leaves an escaped reference as written", () => {
    expect(inline(String.raw`\{X}`)).toBe(String.raw`\{X}`);
  });

  it("leaves an unnamed reference as written", () => {
    expect(inline("{|calc(1 + 2)}")).toBe("{|calc(1 + 2)}");
  });

  it("never writes out a secret", () => {
    expect(inline("{TOKEN}")).toBe("{TOKEN}");
    expect(inline("{TOKEN|uppercase}")).toBe("{TOKEN|uppercase}");
  });

  it("keeps a reference to a secret inside a bare value", () => {
    expect(inline("{AUTH}")).toBe("Bearer {TOKEN}");
  });

  it("never writes out a secret reached through an operation", () => {
    expect(inline("{AUTH|uppercase}")).toBe("{AUTH|uppercase}");
  });
});
