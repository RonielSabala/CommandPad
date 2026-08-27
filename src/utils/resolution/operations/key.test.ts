import { RAW, checkResolution, runbook, secret } from "@/test";
import { describe, expect, it } from "vitest";

import { isMaskedSegment } from "../segments";

checkResolution("key", {
  variables: { PORT: "8080", TOKEN: "abc" },
  cases: [
    ["{PORT|key}", "PORT"],
    ["{PORT|lowercase|key}", "PORT"],
    ['echo "{PORT|key}={PORT}"', 'echo "PORT=8080"'],
    ["{|key}", ""],
    ["{PORT|KEY}", RAW],
  ],
});

describe("a secret referenced through key", () => {
  const book = runbook({ TOKEN: secret("s3cr3t") });

  it("keeps its key, so the preview still masks it", () => {
    const [segment] = book.segments("{TOKEN|key}");
    expect(isMaskedSegment(segment, book.secrets)).toBe(true);
  });
});
