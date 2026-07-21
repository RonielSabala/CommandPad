import type {
  AccountInfo,
  PublicClientApplication as PublicClientApplicationClass,
} from "@azure/msal-browser";

import { SharePointConfig } from "@/common/config";
import { CloudProvider, ExportFormat } from "@/common/enums";
import type { CloudClient, CloudFile } from "./types";
import { CloudSyncError } from "./types";

const JSON_EXTENSION = `.${ExportFormat.JSON}`;

interface DriveItem {
  id: string;
  name: string;
  lastModifiedDateTime?: string;
  folder?: unknown;
}

let msalInstance: PublicClientApplicationClass | null = null;
let readyPromise: Promise<PublicClientApplicationClass> | null = null;

/**
 * Lazily creates and initializes the shared MSAL app instance. `@azure/msal-browser`
 * is a sizable dependency, so it's only fetched (dynamic `import()`) the first
 * time a user actually touches SharePoint sync, not on every page load.
 */
function ensureReady(): Promise<PublicClientApplicationClass> {
  if (!readyPromise) {
    readyPromise = (async () => {
      const { PublicClientApplication, BrowserCacheLocation } = await import(
        "@azure/msal-browser"
      );
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
    // Duck-typed instead of `instanceof InteractionRequiredAuthError` so this
    // module doesn't need a second dynamic import of @azure/msal-browser.
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

async function graphFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
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

  async listFiles(): Promise<CloudFile[]> {
    const response = await graphFetch(
      "/me/drive/special/approot/children?$select=id,name,lastModifiedDateTime,folder&$orderby=lastModifiedDateTime desc",
    );
    const data = (await response.json()) as { value: DriveItem[] };
    return data.value
      .filter((item) => !item.folder && item.name.endsWith(JSON_EXTENSION))
      .map((item) => ({
        id: item.id,
        name: item.name,
        modifiedAt: item.lastModifiedDateTime ?? null,
      }));
  }

  async readFile(file: CloudFile): Promise<string> {
    const response = await graphFetch(
      `/me/drive/items/${encodeURIComponent(file.id)}/content`,
    );
    return response.text();
  }

  async writeFile(
    filename: string,
    content: string,
    mimeType: string,
  ): Promise<void> {
    await graphFetch(
      `/me/drive/special/approot:/${encodeURIComponent(filename)}:/content`,
      {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: content,
      },
    );
  }
}

export const sharePointClient: CloudClient = new SharePointClient();
