import {
  contentTypeHeaders,
  MimeType,
  SharePointConfig,
} from "@/common/config";
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

interface DriveItem {
  id: string;
  name: string;
  lastModifiedDateTime?: string;
  size?: number;
  folder?: unknown;
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
          clientId: SharePointConfig.CLIENT_ID,
          authority: SharePointConfig.AUTHORITY,
          redirectUri: SharePointConfig.REDIRECT_URI,
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
    throw new CloudSyncError("Not signed in to SharePoint");
  }

  try {
    const result = await instance.acquireTokenSilent({
      scopes: [...SharePointConfig.SCOPES],
      account,
    });

    return result.accessToken;
  } catch (error) {
    const needsInteraction =
      error instanceof Error && error.name === "InteractionRequiredAuthError";

    if (needsInteraction) {
      const result = await instance.acquireTokenPopup({
        scopes: [...SharePointConfig.SCOPES],
        account,
      });

      return result.accessToken;
    }

    throw error;
  }
}

async function graphFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const response = await fetch(`${SharePointConfig.GRAPH_BASE_URL}${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new CloudSyncError(
      `Microsoft Graph request failed (${response.status})`,
    );
  }

  return response;
}

async function graphItemExists(path: string): Promise<boolean> {
  const token = await getAccessToken();
  const response = await fetch(`${SharePointConfig.GRAPH_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === HttpStatus.NOT_FOUND) {
    return false;
  }

  if (!response.ok) {
    throw new CloudSyncError(
      `Microsoft Graph request failed (${response.status})`,
    );
  }

  return true;
}

class SharePointClient implements CloudClient {
  readonly provider = CloudProvider.SHAREPOINT;

  isConfigured(): boolean {
    return SharePointConfig.CLIENT_ID.length > 0;
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
      scopes: [...SharePointConfig.SCOPES],
    });

    instance.setActiveAccount(result.account);
  }

  async signOut(): Promise<void> {
    const instance = await ensureReady();
    const account = getActiveAccount(instance);
    await instance.clearCache(account ? { account } : undefined);

    instance.setActiveAccount(null);
  }

  async listEntries(folderId: string | null): Promise<CloudEntry[]> {
    const response = await graphFetch(
      `${folderPath(folderId)}/children?$select=id,name,lastModifiedDateTime,size,folder&$orderby=lastModifiedDateTime desc`,
    );

    const data = (await response.json()) as { value: DriveItem[] };
    const entries = data.value.map((item) => {
      const isFolder = item.folder !== undefined;
      return {
        id: item.id,
        name: item.name,
        isFolder,
        modifiedAt: item.lastModifiedDateTime ?? null,
        size: isFolder ? null : (item.size ?? null),
      };
    });

    return entries.filter(isBrowsableEntry);
  }

  async createFolder(name: string, parentId: string | null): Promise<void> {
    await graphFetch(`${folderPath(parentId)}/children`, {
      method: HttpMethod.POST,
      headers: contentTypeHeaders(MimeType.JSON),
      body: JSON.stringify({
        name,
        folder: {},
        [CONFLICT_BEHAVIOR_PROPERTY]: CONFLICT_BEHAVIOR_FAIL,
      }),
    });
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

export const sharePointClient: CloudClient = new SharePointClient();
