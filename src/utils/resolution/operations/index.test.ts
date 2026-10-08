import {
  BooleanSyntax,
  CaseSyntax,
  OperationSyntax,
  SliceSyntax,
} from "@/common/variableSyntax";
import { RAW, checkResolution } from "@/test";
import { describe, expect, it } from "vitest";

import { applyOperations, getOperationKeywords } from ".";
import type { OperationContext } from "./types";

const { TRUE, FALSE } = BooleanSyntax;

const CONTEXT: OperationContext = { key: "HOST" };

describe("getOperationKeywords", () => {
  it("gives every keyword to exactly one operation", () => {
    const keywords = getOperationKeywords().map(({ keyword }) => keyword);
    expect(new Set(keywords).size).toBe(keywords.length);
  });
});

describe("applyOperations", () => {
  it("dispatches a call written with whitespace around its keyword", () => {
    expect(
      applyOperations(
        "abc",
        [{ text: `  ${SliceSyntax.KEYWORD} (1;)  ` }],
        CONTEXT,
      ),
    ).toEqual({ text: "bc", ok: true });
  });

  it("passes the text through when there is nothing to apply", () => {
    expect(applyOperations("abc", [], CONTEXT)).toEqual({
      text: "abc",
      ok: true,
    });
  });

  it("runs the operations left to right", () => {
    expect(
      applyOperations(
        "payment gateway",
        [{ text: CaseSyntax.UPPER }, { text: `${SliceSyntax.KEYWORD}(0;7)` }],
        CONTEXT,
      ),
    ).toEqual({ text: "PAYMENT", ok: true });
  });

  it("hands each operation the reference's own key", () => {
    expect(
      applyOperations("anything", [{ text: OperationSyntax.KEY }], CONTEXT),
    ).toEqual({
      text: "HOST",
      ok: true,
    });
  });

  it("fails the chain on an operation nobody recognizes", () => {
    expect(
      applyOperations(
        "abc",
        [{ text: CaseSyntax.UPPER }, { text: "nope" }],
        CONTEXT,
      ),
    ).toEqual({
      text: "abc",
      ok: false,
    });
  });

  it("returns the original text on failure, never a half-applied chain", () => {
    expect(
      applyOperations(
        "abc",
        [{ text: CaseSyntax.UPPER }, { text: `${SliceSyntax.KEYWORD}()` }],
        CONTEXT,
      ),
    ).toEqual({
      text: "abc",
      ok: false,
    });
  });
});

checkResolution("a leading ! flips a boolean operation's answer", {
  variables: { PORT: "8080", FILE: "backup.tar.gz", EMPTY: "" },
  cases: [
    ["{EMPTY|!isempty}", FALSE],
    ["{FILE|!isempty}", TRUE],
    ["{PORT|!isdigit}", FALSE],
    ["{FILE|!endswith(.zip)}", TRUE],
    ["{FILE|!endswith(.zip; .tar.gz)}", FALSE],
    ["{|!AND(true;false)}", TRUE],
    ["{|!NOT(true)}", TRUE],
    ["{|!EQUALS(prod;dev)}", TRUE],
    // Whitespace around the keyword
    ["{PORT| ! isdigit }", FALSE],
    ["{FILE| !endswith( .zip ) }", TRUE],
    // A reference that did not resolve still fails the call
    ["{|!EQUALS({MISSING};dev)}", RAW],
  ],
});

checkResolution("only a boolean operation may be negated", {
  variables: { PORT: "8080" },
  cases: [
    ["{PORT|!uppercase}", RAW],
    ["{PORT|!len}", RAW],
    ["{PORT|!slice(0;2)}", RAW],
    ["{|!IF(true;a;b)}", RAW],
    ["{|!date()}", RAW],
    ["{PORT|!nope}", RAW],
    ["{PORT|!!isdigit}", RAW],
  ],
});
