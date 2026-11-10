import { describe, expect, it } from "vitest";

import { zipTreeFiles, type ZipTree } from "./zipTree";

interface Node {
  name: string;
  children?: Node[];
}

const file = (name: string): Node => ({ name });
const folder = (name: string, ...children: Node[]): Node => ({
  name,
  children,
});

const TREE: ZipTree<Node> = {
  children: async (node) => node.children ?? [],
  isFolder: (node): node is Node => !!node.children,
  nameOf: (node) => node.name,
  read: async (node) => node.name,
  extension: ".json",
};

async function paths(
  nodes: Node[],
  tree: ZipTree<Node> = TREE,
): Promise<string[]> {
  return (await zipTreeFiles(tree, nodes)).map((entry) => entry.path);
}

describe("zipTreeFiles", () => {
  it("keeps each root's own name when none clash", async () => {
    expect(await paths([file("a"), folder("b", file("c"))])).toEqual([
      "a.json",
      "b/c.json",
    ]);
  });

  it("numbers roots that clash ignoring case", async () => {
    expect(await paths([file("a"), file("A"), folder("a")])).toEqual([
      "a.json",
      "A (1).json",
      "a/",
    ]);
  });

  it("writes folders past the depth limit empty", async () => {
    expect(
      await paths([folder("a", folder("b", file("c")))], {
        ...TREE,
        maxDepth: 1,
      }),
    ).toEqual(["a/b/"]);
  });

  it("makes names safe to extract", async () => {
    expect(await paths([folder("x:y", file("../z"))])).toEqual(["x-y/-z.json"]);
  });
});
