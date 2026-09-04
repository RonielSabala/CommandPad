import { contentTypeHeaders, MimeType, OneDriveConfig } from "@/common/config";
import { CloudProvider, HttpMethod, HttpStatus } from "@/common/enums";
import type {
  AccountInfo,
  PublicClientApplication as PublicClientApplicationClass,
} from "@azure/msal-browser";
import { isBrowsableEntry } from "./entries";
import type { CloudClient, CloudEntry } from "./types";
import { CloudSyncError } from "./types";

const DRIVE_PATH = "/me/drive";
const APP_ROOT_PATH = `${DRIVE_PATH}/special/approot`;

const CONFLICT_BEHAVIOR_PROPERTY = "@microsoft.graph.conflictBehavior";
const CONFLICT_BEHAVIOR_FAIL = "fail";

function driveItemPath(fileId: string): string {
  return `${DRIVE_PATH}/items/${encodeURIComponent(fileId)}`;
}

function folderPath(folderId: string | null): string {
  return folderId === null ? APP_ROOT_PATH : driveItemPath(folderId);
}

let appRootIdPromise: Promise<string> | null = null;

async function getAppRootId(): Promise<string> {
  appRootIdPromise ??= (async () => {
    const response = await graphFetch(`${APP_ROOT_PATH}?$select=id`);
    const item = (await response.json()) as { id: string };

    return item.id;
  })();

  try {
    return await appRootIdPromise;
  } catch (error) {
    appRootIdPromise = null;
    throw error;
  }
}

async function childrenPath(folderId: string | null): Promise<string> {
  return `${driveItemPath(folderId ?? (await getAppRootId()))}/children`;
}

interface DriveItem {
  id: string;
  name: string;
  lastModifiedDateTime?: string;
  size?: number;
  folder?: { childCount?: number };
}

function toEntry(item: DriveItem): CloudEntry {
  const isFolder = item.folder !== undefined;

  return {
    id: item.id,
    name: item.name,
    isFolder,
    modifiedAt: item.lastModifiedDateTime ?? null,
    size: isFolder ? null : (item.size ?? null),
    itemCount: isFolder ? (item.folder?.childCount ?? null) : null,
  };
}

let msalInstance: PublicClientApplicationClass | null = null;
let readyPromise: Promise<PublicClientApplicationClass> | null = null;

function ensureReady(): Promise<PublicClientApplicationClass> {
  if (!readyPromise) {
    readyPromise = (async () => {
      const { PublicClientApplication, BrowserCacheLocation } =
        await import("@azure/msal-browser");

      const instance = new PublicClientApplication({
        auth: {
          clientId: OneDriveConfig.CLIENT_ID,
          authority: OneDriveConfig.AUTHORITY,
          redirectUri: OneDriveConfig.REDIRECT_URI,
        },
        cache: { cacheLocation: BrowserCacheLocation.LocalStorage },
      });

      await instance.initialize();
      msalInstance = instance;

      return instance;
    })();
  }

  return readyPromise;
}

function getActiveAccount(
  instance: PublicClientApplicationClass,
): AccountInfo | null {
  return instance.getActiveAccount() ?? instance.getAllAccounts()[0] ?? null;
}

async function getAccessToken(): Promise<string> {
  const instance = await ensureReady();
  const account = getActiveAccount(instance);

  if (!account) {
    throw new CloudSyncError("Not signed in to OneDrive");
  }

  try {
    const result = await instance.acquireTokenSilent({
      scopes: [...OneDriveConfig.SCOPES],
      account,
    });

    return result.accessToken;
  } catch (error) {
    const needsInteraction =
      error instanceof Error && error.name === "InteractionRequiredAuthError";

    if (needsInteraction) {
      const result = await instance.acquireTokenPopup({
        scopes: [...OneDriveConfig.SCOPES],
        account,
      });

      return result.accessToken;
    }

    throw error;
  }
}

async function graphError(response: Response): Promise<CloudSyncError> {
  const detail = await response.text().catch(() => "");

  return new CloudSyncError(
    `Microsoft Graph request failed (${response.status})${detail ? `: ${detail}` : ""}`,
  );
}

async function graphFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const response = await fetch(`${OneDriveConfig.GRAPH_BASE_URL}${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await graphError(response);
  }

  return response;
}

async function graphItemExists(path: string): Promise<boolean> {
  const token = await getAccessToken();
  const response = await fetch(`${OneDriveConfig.GRAPH_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === HttpStatus.NOT_FOUND) {
    return false;
  }

  if (!response.ok) {
    throw await graphError(response);
  }

  return true;
}

class OneDriveClient implements CloudClient {
  readonly provider = CloudProvider.ONEDRIVE;

  isConfigured(): boolean {
    return OneDriveConfig.CLIENT_ID.length > 0;
  }

  async init(): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    await ensureReady();
  }

  isSignedIn(): boolean {
    return msalInstance !== null && getActiveAccount(msalInstance) !== null;
  }

  getAccountLabel(): string | null {
    if (!msalInstance) {
      return null;
    }

    return getActiveAccount(msalInstance)?.username ?? null;
  }

  async signIn(): Promise<void> {
    const instance = await ensureReady();
    const result = await instance.loginPopup({
      scopes: [...OneDriveConfig.SCOPES],
    });

    instance.setActiveAccount(result.account);
    appRootIdPromise = null;
  }

  async signOut(): Promise<void> {
    const instance = await ensureReady();
    const account = getActiveAccount(instance);
    await instance.clearCache(account ? { account } : undefined);

    instance.setActiveAccount(null);
    appRootIdPromise = null;
  }

  async listEntries(folderId: string | null): Promise<CloudEntry[]> {
    const response = await graphFetch(
      `${folderPath(folderId)}/children?$select=id,name,lastModifiedDateTime,size,folder&$orderby=lastModifiedDateTime desc`,
    );

    const data = (await response.json()) as { value: DriveItem[] };
    return data.value.map(toEntry).filter(isBrowsableEntry);
  }

  async createFolder(
    name: string,
    parentId: string | null,
  ): Promise<CloudEntry> {
    const response = await graphFetch(await childrenPath(parentId), {
      method: HttpMethod.POST,
      headers: contentTypeHeaders(MimeType.JSON),
      body: JSON.stringify({
        name,
        folder: {},
        [CONFLICT_BEHAVIOR_PROPERTY]: CONFLICT_BEHAVIOR_FAIL,
      }),
    });

    return toEntry((await response.json()) as DriveItem);
  }

  async fileExists(
    filename: string,
    folderId: string | null,
  ): Promise<boolean> {
    return graphItemExists(
      `${folderPath(folderId)}:/${encodeURIComponent(filename)}?$select=id`,
    );
  }

  async readFile(file: CloudEntry): Promise<string> {
    const response = await graphFetch(`${driveItemPath(file.id)}/content`);
    return response.text();
  }

  async writeFile(
    filename: string,
    content: string,
    mimeType: string,
    folderId: string | null,
  ): Promise<void> {
    await graphFetch(
      `${folderPath(folderId)}:/${encodeURIComponent(filename)}:/content`,
      {
        method: HttpMethod.PUT,
        headers: contentTypeHeaders(mimeType),
        body: content,
      },
    );
  }

  async renameEntry(entry: CloudEntry, name: string): Promise<void> {
    await graphFetch(driveItemPath(entry.id), {
      method: HttpMethod.PATCH,
      headers: contentTypeHeaders(MimeType.JSON),
      body: JSON.stringify({ name }),
    });
  }

  async deleteEntry(entry: CloudEntry): Promise<void> {
    await graphFetch(driveItemPath(entry.id), { method: HttpMethod.DELETE });
  }
}

export const oneDriveClient: CloudClient = new OneDriveClient();
