import { CommandSegmentType } from "@/common/enums";
import type { CommandSegment } from "@/common/types";
import { runbook, secret } from "@/test";
import { describe, expect, it } from "vitest";

import { countCommandLines, isMaskedSegment } from "./segments";

const book = runbook({
  HOST: "example.com",
  TOKEN: secret("s3cr3t"),
  LINES: "one\ntwo\nthree",
});

describe("resolveCommandText", () => {
  it("splits a command into literal and resolved segments", () => {
    expect(book.segments("ssh {HOST} -v")).toEqual<CommandSegment[]>([
      { text: "ssh ", type: CommandSegmentType.LITERAL },
      {
        key: "HOST",
        text: "example.com",
        type: CommandSegmentType.RESOLVED,
      },
      { text: " -v", type: CommandSegmentType.LITERAL },
    ]);
  });

  it("keeps a transformed segment's key, so masking still applies", () => {
    const [segment] = book.segments("{TOKEN|slice(0;4)}");
    expect(segment).toEqual({
      key: "TOKEN",
      text: "s3cr",
      type: CommandSegmentType.RESOLVED,
    });
  });
});

describe("isMaskedSegment", () => {
  it("masks a resolved segment whose key is secret", () => {
    const [segment] = book.segments("{TOKEN}");
    expect(isMaskedSegment(segment, book.secrets)).toBe(true);
  });

  it("leaves a segment whose key is not secret alone", () => {
    const [segment] = book.segments("{HOST}");
    expect(isMaskedSegment(segment, book.secrets)).toBe(false);
  });

  it("never masks a literal, which has no key", () => {
    const [segment] = book.segments("plain text");
    expect(isMaskedSegment(segment, book.secrets)).toBe(false);
  });

  it("never masks an unresolved segment, which shows the reference itself", () => {
    const [segment] = book.segments("{MISSING}");
    expect(isMaskedSegment(segment, book.secrets)).toBe(false);
  });
});

describe("countCommandLines", () => {
  function lines(command: string): number {
    return countCommandLines(book.segments(command), book.secrets);
  }

  it("counts a single line as one", () => {
    expect(lines("echo hi")).toBe(1);
  });

  it("counts the lines a literal holds", () => {
    expect(lines("one\ntwo\nthree")).toBe(3);
  });

  it("counts the lines a resolved value adds", () => {
    expect(lines("echo {LINES}")).toBe(3);
  });

  it("skips a masked secret, which draws as one mask however tall it is", () => {
    expect(lines("auth {TOKEN}\nnext")).toBe(2);
  });
});
