import { CommandSegmentType } from "@/common/enums";
import { RAW, checkResolution, checkValues, runbook } from "@/test";
import { describe, expect, it } from "vitest";

const HOSTS = {
  HOST: "example.com",
  USER: "root",
  PORT: "8080",
  EMPTY: "",
  "MY VAR": "spaced",
};

checkResolution("substituting a reference", {
  variables: HOSTS,
  cases: [
    ["{HOST}", "example.com"],
    ["ssh {USER}@{HOST}", "ssh root@example.com"],
    ["ssh {USER}@{HOST} -p {PORT}", "ssh root@example.com -p 8080"],
    ["no references here", "no references here"],
    ["", ""],
  ],
});

checkResolution("a reference's layout is not part of its meaning", {
  variables: HOSTS,
  cases: [
    ["{ HOST }", "example.com"],
    ["{\n  HOST\n}", "example.com"],
    ["{ MY VAR }", "spaced"],
    ["{HOST |uppercase}", "EXAMPLE.COM"],
    ["{\n  HOST\n  | uppercase\n}", "EXAMPLE.COM"],
  ],
});

checkResolution("a reference that does not resolve renders raw", {
  variables: HOSTS,
  cases: [
    ["{MISSING}", RAW],
    ["{EMPTY}", RAW],
    ["{HOST|nosuchoperation}", RAW],
    ["{HOST|slice(1 2;)}", RAW],
    ["{HOST|slice({MISSING};)}", RAW],
    ["{{HOST}}", RAW],
  ],
});

describe("an unresolved reference leaves the rest of the command alone", () => {
  const book = runbook(HOSTS);

  it("keeps the resolved references around it", () => {
    expect(book.resolve("{USER}@{MISSING}:{PORT}")).toBe("root@{MISSING}:8080");
  });

  it("marks only that segment unresolved", () => {
    expect(
      book.segments("{USER}@{MISSING}").map((segment) => segment.type),
    ).toEqual([
      CommandSegmentType.RESOLVED,
      CommandSegmentType.LITERAL,
      CommandSegmentType.UNRESOLVED,
    ]);
  });
});

checkResolution("escaping a brace", {
  variables: HOSTS,
  cases: [
    [String.raw`\{HOST}`, "{HOST}"],
    [String.raw`\{HOST} is {HOST}`, "{HOST} is example.com"],
    [String.raw`echo \{a,b\}`, String.raw`echo {a,b\}`],
  ],
});

checkResolution("a shell's own braces are left alone", {
  variables: HOSTS,
  cases: [
    ["find . -name '*.log' -exec rm {} +", RAW],
    ["awk '{;a;b}'", RAW],
    ["echo { unclosed and {HOST}", "echo { unclosed and example.com"],
  ],
});

checkResolution("references nest to any depth", {
  variables: {
    ...HOSTS,
    TEMPLATE: "projects/{;name}/src",
    INDEX: "2",
  },
  cases: [
    ["{TEMPLATE;name={USER}}", "projects/root/src"],
    ["{HOST|slice({INDEX};)}", "ample.com"],
    ["{HOST|slice({INDEX|slice(0;1)};)}", "ample.com"],
    ["{HOST|uppercase|slice(0;3)}", "EXA"],
  ],
});

checkResolution("an unnamed reference names no variable", {
  variables: HOSTS,
  cases: [
    ["{|key}", ""],
    ["{}", RAW],
    ["{;name}", RAW],
  ],
});

describe("the known limitation: a literal pipe inside a param value", () => {
  const book = runbook({ CMD: "run {;flag}" });

  it("reads as an operation separator and fails loudly", () => {
    expect(book.hasUnresolved("{CMD;flag=a|b}")).toBe(true);
  });
});

checkValues("a value surface resolves references the same way", {
  variables: {
    HOST: "example.com",
    URL: "https://{HOST}/health",
    UPPER: "{HOST|uppercase}",
    CHAIN: "{URL}?v=1",
    EMPTY: "",
    GREETING: "hi{EMPTY}!",
  },
  expected: {
    HOST: "example.com",
    URL: "https://example.com/health",
    UPPER: "EXAMPLE.COM",
    CHAIN: "https://example.com/health?v=1",
    GREETING: "hi!",
  },
});
