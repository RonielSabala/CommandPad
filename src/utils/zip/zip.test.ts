import { describe, expect, it } from "vitest";

import {
  createZip,
  emptyZipFolder,
  readZip,
  readZipText,
  textZipFile,
} from "./index";

// Written by Python's zipfile to a stream, with a non-ASCII name
const STREAMED_ZIP =
  "UEsDBBQACAgIAAAAIQAAAAAAAAAAAAAAAAASAAYAb3BzL2RlcGxveSDDsS5qc29umZkCAGFiq1ZKyslPzi5WsoqO1VEqSyzKTEzKSQVza6tpIAcAUEsHCNt1dlYeAAAAcAAAAFBLAwQUAAgACAAjBGldAAAAAAAAAAAAAAAACgAAAHJlYWRtZS50eHQryEnMzAMAUEsHCM9iIBkHAAAABQAAAFBLAQIUABQACAgIAAAAIQDbdXZWHgAAAHAAAAASAAYAAAAAAAAAAACAAQAAAABvcHMvZGVwbG95IMOxLmpzb26ZmQIAYWJQSwECFAAUAAgACAAjBGldz2IgGQcAAAAFAAAACgAAAAAAAAAAAAAAgAFkAAAAcmVhZG1lLnR4dFBLBQYAAAAAAgACAH4AAACjAAAADgBtYWRlIGVsc2V3aGVyZQ==";

const streamedZip = () =>
  new Blob([Uint8Array.from(atob(STREAMED_ZIP), (c) => c.charCodeAt(0))]);

describe("readZip", () => {
  it("reads back what createZip wrote, non-ASCII names too", async () => {
    const entries = await readZip(
      createZip([
        textZipFile("ops/déploy.json", '{"a":1}'),
        emptyZipFolder("empty/"),
        textZipFile("top.json", ""),
      ]),
    );

    expect(entries.map((entry) => entry.path)).toEqual([
      "ops/déploy.json",
      "empty/",
      "top.json",
    ]);
    expect(await Promise.all(entries.map(readZipText))).toEqual([
      '{"a":1}',
      "",
      "",
    ]);
  });

  it("reads a deflated, streamed zip with a UTF-8 name", async () => {
    const entries = await readZip(streamedZip());

    expect(entries.map((entry) => entry.path)).toEqual([
      "ops/deploy ñ.json",
      "readme.txt",
    ]);
    expect(await readZipText(entries[0])).toBe(
      '{"blocks":[],"variables":[]}'.repeat(4),
    );
    expect(await readZipText(entries[1])).toBe("plain");
  });

  it("refuses what isn't a zip", async () => {
    await expect(readZip(new Blob(["not a zip"]))).rejects.toThrow();
    await expect(readZip(new Blob([]))).rejects.toThrow();
  });

  it("notices corrupted data only in the entry that holds it", async () => {
    const blob = createZip([textZipFile("a.json", "hello")]);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    bytes[bytes.indexOf("h".charCodeAt(0))] ^= 1;

    const [entry] = await readZip(new Blob([bytes]));

    await expect(entry.read()).rejects.toThrow();
  });
});
