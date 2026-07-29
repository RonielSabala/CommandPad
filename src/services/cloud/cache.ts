import type { CloudProvider } from "@/common/enums";
import type { CloudEntry } from "./types";

const LISTINGS = new Map<CloudProvider, Map<string | null, CloudEntry[]>>();

export function getCachedCloudEntries(
  provider: CloudProvider,
  folderId: string | null,
): CloudEntry[] | null {
  return LISTINGS.get(provider)?.get(folderId) ?? null;
}

export function setCachedCloudEntries(
  provider: CloudProvider,
  folderId: string | null,
  entries: CloudEntry[],
): void {
  const listings =
    LISTINGS.get(provider) ?? new Map<string | null, CloudEntry[]>();

  listings.set(folderId, entries);
  LISTINGS.set(provider, listings);
}

export function clearCachedCloudEntries(provider: CloudProvider): void {
  LISTINGS.delete(provider);
}
