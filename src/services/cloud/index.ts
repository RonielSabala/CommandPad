import { CloudProvider } from "@/common/enums";
import { googleDriveClient } from "./googleDrive";
import { sharePointClient } from "./sharepoint";
import type { CloudClient } from "./types";

export type { CloudClient, CloudFile } from "./types";
export { CloudSyncError } from "./types";

const CLOUD_CLIENTS: Record<CloudProvider, CloudClient> = {
  [CloudProvider.SHAREPOINT]: sharePointClient,
  [CloudProvider.GOOGLE_DRIVE]: googleDriveClient,
};

export function getCloudClient(provider: CloudProvider): CloudClient {
  return CLOUD_CLIENTS[provider];
}
