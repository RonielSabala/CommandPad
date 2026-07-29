import { CloudSyncConfig } from "@/common/config";
import type { CloudClient, CloudEntry, CloudFolderRef } from "./types";

export interface CloudSearchEntry {
  entry: CloudEntry;
  path: CloudFolderRef[];
}

const ROOT_PATH: CloudFolderRef[] = [];

export async function walkCloudTree(
  client: CloudClient,
): Promise<CloudSearchEntry[]> {
  const found: CloudSearchEntry[] = [];
  let level: CloudFolderRef[][] = [ROOT_PATH];

  for (
    let depth = 0;
    level.length > 0 && depth < CloudSyncConfig.MAX_SEARCH_DEPTH;
    depth++
  ) {
    const listings = await Promise.all(
      level.map((path) => client.listEntries(path.at(-1)?.id ?? null)),
    );

    const next: CloudFolderRef[][] = [];
    listings.forEach((entries, index) => {
      const path = level[index];

      for (const entry of entries) {
        found.push({ entry, path });

        if (entry.isFolder) {
          next.push([...path, { id: entry.id, name: entry.name }]);
        }
      }
    });

    level = next;
  }

  return found;
}
