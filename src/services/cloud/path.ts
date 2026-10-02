import { JSON_EXTENSION } from "@/common/config";
import { cloudPathSegments } from "@/utils/embeddedRunbook";

import { getCachedCloudEntries, setCachedCloudEntries } from "./cache";
import type { CloudClient, CloudEntry } from "./types";

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

export async function resolveCloudPath(
  client: CloudClient,
  path: string,
): Promise<CloudEntry | null> {
  const segments = cloudPathSegments(path);
  const filename = segments.pop();
  if (!filename) {
    return null;
  }

  let folderId: string | null = null;
  for (const segment of segments) {
    const folder = findNamed(await listFolder(client, folderId), segment, true);
    if (!folder) {
      return null;
    }

    folderId = folder.id;
  }

  const named = filename.toLowerCase().endsWith(JSON_EXTENSION)
    ? filename
    : filename + JSON_EXTENSION;

  return findNamed(await listFolder(client, folderId), named, false);
}
