import { CloudSyncConfig, JSON_EXTENSION, MimeType } from "@/common/config";
import { stripJsonExtension } from "@/utils/export";
import { createZip } from "@/utils/zip";
import { zipTreeFiles, type ZipTree } from "@/utils/zipTree";
import type { CloudClient, CloudEntry } from "./types";

export async function copyCloudEntry(
  client: CloudClient,
  entry: CloudEntry,
  parentId: string | null,
  name: string,
  depth = 0,
): Promise<void> {
  if (!entry.isFolder) {
    const content = await client.readFile(entry);
    await client.writeFile(name, content, MimeType.JSON, parentId);
    return;
  }

  const created = await client.createFolder(name, parentId);
  if (depth >= CloudSyncConfig.MAX_SEARCH_DEPTH) {
    return;
  }

  const children = await client.listEntries(entry.id);
  for (const child of children) {
    await copyCloudEntry(client, child, created.id, child.name, depth + 1);
  }
}

/** The entries and everything inside them as one zip. */
export async function buildCloudEntriesZip(
  client: CloudClient,
  entries: readonly CloudEntry[],
): Promise<Blob> {
  const tree: ZipTree<CloudEntry> = {
    children: (folder) => client.listEntries(folder.id),
    isFolder: (entry): entry is CloudEntry => entry.isFolder,
    nameOf: (entry) =>
      entry.isFolder ? entry.name : stripJsonExtension(entry.name),
    read: (file) => client.readFile(file),
    extension: JSON_EXTENSION,
    maxDepth: CloudSyncConfig.MAX_SEARCH_DEPTH,
  };

  return createZip(await zipTreeFiles(tree, entries));
}
