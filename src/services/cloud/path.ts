import { JSON_EXTENSION, RunbookBlockConfig } from "@/common/config";
import { cloudPathSegments } from "@/utils/embeddedRunbook";

import { getCachedCloudEntries, setCachedCloudEntries } from "./cache";
import type { CloudClient, CloudEntry, CloudFileLocation } from "./types";

async function listFolder(
  client: CloudClient,
  folderId: string | null,
): Promise<CloudEntry[]> {
  const cached = getCachedCloudEntries(client.provider, folderId);
  if (cached) {
    return cached;
  }

  const entries = await client.listEntries(folderId);
  setCachedCloudEntries(client.provider, folderId, entries);
  return entries;
}

function findNamed(
  entries: CloudEntry[],
  name: string,
  isFolder: boolean,
): CloudEntry | null {
  const lower = name.toLowerCase();
  let caseless: CloudEntry | null = null;

  for (const entry of entries) {
    if (entry.isFolder !== isFolder) {
      continue;
    }

    if (entry.name === name) {
      return entry;
    }

    if (!caseless && entry.name.toLowerCase() === lower) {
      caseless = entry;
    }
  }

  return caseless;
}

/** The folder a path names, with what it holds. */
async function walkToFolder(
  client: CloudClient,
  path: string,
): Promise<{ folderId: string | null; entries: CloudEntry[] } | null> {
  let folderId: string | null = null;

  for (const segment of cloudPathSegments(path)) {
    const folder = findNamed(await listFolder(client, folderId), segment, true);
    if (!folder) {
      return null;
    }

    folderId = folder.id;
  }

  return { folderId, entries: await listFolder(client, folderId) };
}

export async function listCloudFolder(
  client: CloudClient,
  path: string,
): Promise<CloudEntry[] | null> {
  return (await walkToFolder(client, path))?.entries ?? null;
}

export async function resolveCloudFile(
  client: CloudClient,
  path: string,
): Promise<CloudFileLocation | null> {
  const segments = cloudPathSegments(path);
  const filename = segments.pop();
  if (!filename) {
    return null;
  }

  const folder = await walkToFolder(
    client,
    segments.join(RunbookBlockConfig.PATH_SEPARATOR),
  );
  if (!folder) {
    return null;
  }

  const named = filename.toLowerCase().endsWith(JSON_EXTENSION)
    ? filename
    : filename + JSON_EXTENSION;

  const file = findNamed(folder.entries, named, false);
  return file && { file, folderId: folder.folderId };
}
