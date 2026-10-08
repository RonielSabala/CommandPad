import { RAW, checkResolution, checkValues, partial } from "@/test";
import { describe, expect, it } from "vitest";

import { getTemplateParamNames } from "./params";

checkResolution("filling a template blank", {
  variables: {
    PROJECT: "projects/{;name}/src",
    GREETING: "Hi {;first} {;last}",
    NAME: "cp",
  },
  cases: [
    ["{PROJECT;name=cp}", "projects/cp/src"],
    ["{GREETING;first=Ada;last=Lovelace}", "Hi Ada Lovelace"],
    ["{PROJECT;name={NAME}}", "projects/cp/src"],
    ["{PROJECT; name = two words }", "projects/two words/src"],
    // An unfilled blank is a hole, not a failure
    ["{PROJECT}", partial("projects/{;name}/src")],
    ["{GREETING;first=Ada}", partial("Hi Ada {;last}")],
    // A transform over a value with a hole in it fails the reference
    ["{PROJECT|uppercase}", RAW],
  ],
});

checkResolution("a blank declares its own default", {
  variables: {
    GREETING: "Hi {;name=Sam}",
    REPEATED: "{;a=1} {;a}",
    DISAGREE: "{;a=1} {;a=2}",
    BRANCH: "feature/{;name=none|kebabcase}",
    NESTED: "{;a} {;b={;a|uppercase}}",
    SELF: "{;a={;a}}",
  },
  cases: [
    ["{GREETING}", "Hi Sam"],
    ["{GREETING;name=Bob}", "Hi Bob"],
    ["{REPEATED}", "1 1"],
    ["{DISAGREE}", "1 1"],
    ["{BRANCH}", "feature/none"],
    ["{BRANCH;name=Add Login}", "feature/add-login"],
    ["{NESTED;a=hi}", "hi HI"],
    // A default that reads itself resolves to nothing
    ["{SELF}", partial("{;a={;a}}")],
  ],
});

checkResolution("a blank carries operations of its own", {
  variables: {
    SHOUT: "x{;p|uppercase}y",
    CUT: "{;p|slice(0;2)}",
    NAMED: "{;p|key}",
  },
  cases: [
    ["{SHOUT;p=hello}", "xHELLOy"],
    ["{CUT;p=abcdef}", "ab"],
    ["{NAMED;p=ignored}", "NAMED"],
  ],
});

checkResolution("filling a blank resolves what the fill produced", {
  variables: {
    TARGET: "projects/{;name}/src",
    OUTER: "{TARGET;name={;b_param}}",
    ESCAPED: String.raw`\{TARGET;name={;b_param}}`,
  },
  cases: [
    ["{OUTER;b_param=test}", "projects/test/src"],
    ["{ESCAPED;b_param=test}", "{TARGET;name=test}"],
  ],
});

checkResolution("a backslash makes a blank literal", {
  variables: {
    LITERAL: String.raw`a \{;b}`,
    VIA: "{LITERAL}",
    PLAIN: "a {;b}",
    MIXED: String.raw`\{;a} {;a}`,
  },
  cases: [
    ["{LITERAL}", "a {;b}"],
    ["{VIA}", "a {;b}"],
    ["{LITERAL;b=1}", "a {;b}"],
    ["{PLAIN;b=1}", "a 1"],
    ["{MIXED;a=1}", "{;a} 1"],
    ["{MIXED}", partial("{;a} {;a}")],
  ],
});

checkValues("an escaped blank keeps its backslash until a command reads it", {
  variables: {
    LITERAL: String.raw`a \{;b}`,
    VIA: "{LITERAL}",
  },
  expected: {
    LITERAL: String.raw`a \{;b}`,
    VIA: String.raw`a \{;b}`,
  },
});

checkValues("a blank stays a blank until something fills it", {
  variables: {
    PROJECT: "projects/{;name}/src",
    DEFAULTED: "Hi {;name=Sam}",
    VIA: "{DEFAULTED}",
  },
  expected: {
    PROJECT: "projects/{;name}/src",
    DEFAULTED: "Hi {;name=Sam}",
    VIA: "Hi Sam",
  },
});

describe("getTemplateParamNames", () => {
  it("is empty for a value with no blanks", () => {
    expect(getTemplateParamNames("plain text")).toEqual([]);
  });

  it("names every blank a value declares, once each", () => {
    expect(getTemplateParamNames("{;first} {;last} {;first}")).toEqual([
      "first",
      "last",
    ]);
  });

  it("names a blank that carries a default or operations", () => {
    expect(getTemplateParamNames("{;name=Sam|uppercase}")).toEqual(["name"]);
  });

  it("descends into a default, since that name is still fillable", () => {
    expect(getTemplateParamNames("{;b={;a|uppercase}}")).toEqual(["b", "a"]);
  });

  it("finds a blank sitting inside another reference's params", () => {
    expect(getTemplateParamNames("{LOG_DIR;service={;service}}/log")).toEqual([
      "service",
    ]);
  });

  it("ignores an escaped blank", () => {
    expect(getTemplateParamNames(String.raw`{;a} \{;b}`)).toEqual(["a"]);
  });

  it("ignores a brace group that is not a blank", () => {
    expect(getTemplateParamNames("awk '{;a;b}'")).toEqual([]);
  });
});
