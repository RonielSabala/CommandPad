import { ZipConfig } from "@/common/config";

import { folderPath } from "./path";
import { claimUniqueName } from "./string";
import { emptyZipFolder, textZipFile, type ZipFile } from "./zip";

type ZipNode<Folder, File> = Folder | File;

/** A tree of folders and files. */
export interface ZipTree<Folder, File = Folder> {
  children: (
    folder: Folder,
  ) =>
    | readonly ZipNode<Folder, File>[]
    | Promise<readonly ZipNode<Folder, File>[]>;
  isFolder: (node: ZipNode<Folder, File>) => node is Folder;
  /** A file's name leaves out `extension`. */
  nameOf: (node: ZipNode<Folder, File>) => string;
  read: (file: File) => Promise<string>;
  extension: string;
  /** How many folders deep the walk goes. */
  maxDepth?: number;
}

const UNSAFE_CHARS_REGEX = /[<>:"/\\|?*\p{Cc}]/gu;
const UNSAFE_EDGES_REGEX = /^[\s.]+|[\s.]+$/g;

/** `name` as a path part any file system can extract. */
export function safeZipName(name: string): string {
  const safe = name
    .replace(UNSAFE_CHARS_REGEX, ZipConfig.UNSAFE_CHAR_REPLACEMENT)
    .replace(UNSAFE_EDGES_REGEX, "");

  return safe || ZipConfig.FALLBACK_NAME;
}

/** `nodes` and everything inside them as zip files under `prefix`. */
export async function zipTreeFiles<Folder, File>(
  tree: ZipTree<Folder, File>,
  nodes: readonly ZipNode<Folder, File>[],
  prefix = "",
  depth = 0,
): Promise<ZipFile[]> {
  const taken = new Set<string>();
  const named = nodes.map((node) => {
    const name = claimUniqueName(
      taken,
      safeZipName(tree.nameOf(node)),
      tree.isFolder(node) ? "" : tree.extension,
    );

    return { node, path: `${prefix}${name}` };
  });

  const nested = await Promise.all(
    named.map(async ({ node, path }) => {
      if (!tree.isFolder(node)) {
        return [textZipFile(path, await tree.read(node))];
      }

      const folderPrefix = folderPath([path]);
      const children =
        depth < (tree.maxDepth ?? Infinity) ? await tree.children(node) : [];

      return children.length > 0
        ? zipTreeFiles(tree, children, folderPrefix, depth + 1)
        : [emptyZipFolder(folderPrefix)];
    }),
  );

  return nested.flat();
}
