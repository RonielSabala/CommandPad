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
): CloudEntry | undefined {
  const candidates = entries.filter((entry) => entry.isFolder === isFolder);
  const lower = name.toLowerCase();

  return (
    candidates.find((entry) => entry.name === name) ??
    candidates.find((entry) => entry.name.toLowerCase() === lower)
  );
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

  const entries = await listFolder(client, folderId);
  const named = filename.endsWith(JSON_EXTENSION)
    ? filename
    : filename + JSON_EXTENSION;

  return (
    findNamed(entries, filename, false) ??
    findNamed(entries, named, false) ??
    null
  );
}
