import { CloudProvider } from "@/common/enums";
import { googleDriveClient } from "./googleDrive";
import { sharePointClient } from "./sharepoint";
import type { CloudClient } from "./types";
export {
  clearCachedCloudEntries,
  getCachedCloudEntries,
  setCachedCloudEntries
} from "./cache";
export {
  buildDuplicateName,
  compareCloudEntries,
  DEFAULT_CLOUD_SORT
} from "./entries";
export type { CloudSort } from "./entries";
export { walkCloudTree } from "./search";
export {
  buildCloudEntriesZip,
  buildCloudFolderZip,
  copyCloudEntry
} from "./transfer";
export { CloudSyncError } from "./types";
export type {
  CloudClient,
  CloudEntry,
  CloudFolderRef,
  PlacedCloudEntry
} from "./types";

const CLOUD_CLIENTS: Record<CloudProvider, CloudClient> = {
  [CloudProvider.SHAREPOINT]: sharePointClient,
  [CloudProvider.GOOGLE_DRIVE]: googleDriveClient,
};

export function getCloudClient(provider: CloudProvider): CloudClient {
  return CLOUD_CLIENTS[provider];
}
