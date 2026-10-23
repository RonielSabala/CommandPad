import {
  getCachedCloudEntries,
  type CloudEntry,
  type CloudFolderRef,
  type PlacedCloudEntry,
} from "@/services/cloud";

import type { StoreState } from "./types";

export const ROOT_CLOUD_PATH: CloudFolderRef[] = [];

export function currentFolderId(path: CloudFolderRef[]): string | null {
  return path.at(-1)?.id ?? null;
}

/** The search result an entry came from, or null when browsing a folder. */
function cloudSearchMatch(
  state: StoreState,
  entry: CloudEntry,
): PlacedCloudEntry | null {
  return (
    state.cloudSearchEntries.find((result) => result.entry.id === entry.id) ??
    null
  );
}

/** The path to the folder holding `entry`. */
export function parentFolderPath(
  state: StoreState,
  entry: CloudEntry,
): CloudFolderRef[] {
  return (
    state.cloudSelectedEntries.get(entry.id)?.path ??
    cloudSearchMatch(state, entry)?.path ??
    state.cloudPath
  );
}

/** The folder holding `entry`. */
export function parentFolderId(
  state: StoreState,
  entry: CloudEntry,
): string | null {
  return currentFolderId(parentFolderPath(state, entry));
}

/** The listing of the folder holding `entry`. */
export function siblingEntries(
  state: StoreState,
  entry: CloudEntry,
): CloudEntry[] {
  const folderId = currentFolderId(parentFolderPath(state, entry));
  if (folderId === currentFolderId(state.cloudPath)) {
    return state.cloudEntries;
  }

  const walked = state.cloudSearchEntries.filter(
    (result) => currentFolderId(result.path) === folderId,
  );

  // A folder a search walked, else whatever browsing it last cached
  return walked.length > 0
    ? walked.map((result) => result.entry)
    : (getCachedCloudEntries(state.cloudProvider, folderId) ?? []);
}
