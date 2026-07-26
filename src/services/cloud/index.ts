import { CloudProvider } from "@/common/enums";
import { googleDriveClient } from "./googleDrive";
import { sharePointClient } from "./sharepoint";
import type { CloudClient } from "./types";
export { walkCloudTree } from "./search";
export type { CloudSearchEntry } from "./search";
export { CloudSyncError } from "./types";
export type { CloudClient, CloudEntry, CloudFolderRef } from "./types";

const CLOUD_CLIENTS: Record<CloudProvider, CloudClient> = {
  [CloudProvider.SHAREPOINT]: sharePointClient,
  [CloudProvider.GOOGLE_DRIVE]: googleDriveClient,
};

export function getCloudClient(provider: CloudProvider): CloudClient {
  return CLOUD_CLIENTS[provider];
}
