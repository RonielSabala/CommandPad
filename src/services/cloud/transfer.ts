import { CloudSyncConfig, MimeType } from "@/common/config";
import { createZip, type ZipFile } from "@/utils/zip";
import { buildDuplicateName } from "./entries";
import type { CloudClient, CloudEntry } from "./types";

const encoder = new TextEncoder();
const EMPTY_FOLDER_DATA = new Uint8Array(0);

function joinZipPath(prefix: string, name: string): string {
  return `${prefix}${CloudSyncConfig.PATH_SEPARATOR}${name}`;
}

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

async function collectZipFiles(
  client: CloudClient,
  folderId: string,
  prefix: string,
  depth: number,
): Promise<ZipFile[]> {
  const children =
    depth >= CloudSyncConfig.MAX_SEARCH_DEPTH
      ? []
      : await client.listEntries(folderId);

  if (children.length === 0) {
    // A trailing separator is how a zip stores an empty folder
    return [
      {
        path: `${prefix}${CloudSyncConfig.PATH_SEPARATOR}`,
        data: EMPTY_FOLDER_DATA,
      },
    ];
  }

  const nested = await Promise.all(
    children.map(async (child) => {
      const path = joinZipPath(prefix, child.name);

      return child.isFolder
        ? collectZipFiles(client, child.id, path, depth + 1)
        : [{ path, data: encoder.encode(await client.readFile(child)) }];
    }),
  );

  return nested.flat();
}

export async function buildCloudFolderZip(
  client: CloudClient,
  folder: CloudEntry,
): Promise<Blob> {
  return createZip(await collectZipFiles(client, folder.id, folder.name, 0));
}

export async function buildCloudEntriesZip(
  client: CloudClient,
  entries: CloudEntry[],
): Promise<Blob> {
  const taken: string[] = [];
  const nested: ZipFile[][] = [];

  for (const entry of entries) {
    const root = buildDuplicateName(entry, taken);
    taken.push(root);
    nested.push(
      entry.isFolder
        ? await collectZipFiles(client, entry.id, root, 0)
        : [{ path: root, data: encoder.encode(await client.readFile(entry)) }],
    );
  }

  return createZip(nested.flat());
}
