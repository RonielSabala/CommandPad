import { CloudSyncConfig, GoogleDriveConfig } from "@/common/config";
import { CloudProvider, ExportFormat } from "@/common/enums";
import type { CloudClient, CloudFile } from "./types";
import { CloudSyncError } from "./types";

const GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";
const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
const JSON_EXTENSION = `.${ExportFormat.JSON}`;

interface DriveFileResource {
  id: string;
  name: string;
  modifiedTime?: string;
  mimeType?: string;
}

let scriptPromise: Promise<void> | null = null;
let accessToken: string | null = null;
let accountLabel: string | null = null;
let appFolderId: string | null = null;

function loadScript(): Promise<void> {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      if (window.google?.accounts?.oauth2) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = GIS_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new CloudSyncError("Failed to load Google Identity Services"));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

function requestToken(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    void loadScript().then(() => {
      if (!window.google) {
        reject(new CloudSyncError("Google Identity Services unavailable"));
        return;
      }

      // GIS callbacks are bound per requestAccessToken call, so a fresh
      // token client is created for every sign-in attempt.
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GoogleDriveConfig.CLIENT_ID,
        scope: GoogleDriveConfig.SCOPES,
        callback: (response) => {
          if (response.error || !response.access_token) {
            reject(new CloudSyncError("Google sign-in failed"));
            return;
          }
          resolve(response.access_token);
        },
        error_callback: () => {
          reject(new CloudSyncError("Google sign-in was cancelled"));
        },
      });
      client.requestAccessToken({ prompt });
    });
  });
}

async function driveFetch(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  if (!accessToken) {
    throw new CloudSyncError("Not signed in to Google Drive");
  }

  const response = await fetch(url, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new CloudSyncError(`Google Drive request failed (${response.status})`);
  }

  return response;
}

async function findAppFolderId(): Promise<string> {
  if (appFolderId) {
    return appFolderId;
  }

  const query = encodeURIComponent(
    `mimeType='${FOLDER_MIME_TYPE}' and name='${CloudSyncConfig.APP_FOLDER_NAME}' and 'root' in parents and trashed=false`,
  );
  const searchResponse = await driveFetch(
    `${GoogleDriveConfig.API_BASE_URL}/files?q=${query}&fields=files(id,name)&spaces=drive`,
  );
  const searchData = (await searchResponse.json()) as {
    files: { id: string }[];
  };

  if (searchData.files.length > 0) {
    appFolderId = searchData.files[0].id;
    return appFolderId;
  }

  const createResponse = await driveFetch(
    `${GoogleDriveConfig.API_BASE_URL}/files?fields=id`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: CloudSyncConfig.APP_FOLDER_NAME,
        mimeType: FOLDER_MIME_TYPE,
      }),
    },
  );
  const created = (await createResponse.json()) as { id: string };
  appFolderId = created.id;
  return appFolderId;
}

async function findFileByName(
  folderId: string,
  filename: string,
): Promise<string | null> {
  const query = encodeURIComponent(
    `'${folderId}' in parents and name='${filename}' and trashed=false`,
  );
  const response = await driveFetch(
    `${GoogleDriveConfig.API_BASE_URL}/files?q=${query}&fields=files(id)&spaces=drive`,
  );
  const data = (await response.json()) as { files: { id: string }[] };
  return data.files[0]?.id ?? null;
}

class GoogleDriveClient implements CloudClient {
  readonly provider = CloudProvider.GOOGLE_DRIVE;

  isConfigured(): boolean {
    return GoogleDriveConfig.CLIENT_ID.length > 0;
  }

  async init(): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }
    await loadScript();
  }

  isSignedIn(): boolean {
    return accessToken !== null;
  }

  getAccountLabel(): string | null {
    return accountLabel;
  }

  async signIn(): Promise<void> {
    accessToken = await requestToken("consent");

    try {
      const response = await driveFetch(
        `${GoogleDriveConfig.API_BASE_URL}/about?fields=user`,
      );
      const data = (await response.json()) as {
        user?: { displayName?: string; emailAddress?: string };
      };
      accountLabel = data.user?.emailAddress ?? data.user?.displayName ?? null;
    } catch {
      accountLabel = null;
    }
  }

  async signOut(): Promise<void> {
    if (accessToken && window.google) {
      window.google.accounts.oauth2.revoke(accessToken, () => {});
    }
    accessToken = null;
    accountLabel = null;
    appFolderId = null;
  }

  async listFiles(): Promise<CloudFile[]> {
    const folderId = await findAppFolderId();
    const query = encodeURIComponent(
      `'${folderId}' in parents and trashed=false`,
    );
    const response = await driveFetch(
      `${GoogleDriveConfig.API_BASE_URL}/files?q=${query}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&spaces=drive`,
    );
    const data = (await response.json()) as { files: DriveFileResource[] };
    return data.files
      .filter((item) => item.name.endsWith(JSON_EXTENSION))
      .map((item) => ({
        id: item.id,
        name: item.name,
        modifiedAt: item.modifiedTime ?? null,
      }));
  }

  async readFile(file: CloudFile): Promise<string> {
    const response = await driveFetch(
      `${GoogleDriveConfig.API_BASE_URL}/files/${encodeURIComponent(file.id)}?alt=media`,
    );
    return response.text();
  }

  async writeFile(
    filename: string,
    content: string,
    mimeType: string,
  ): Promise<void> {
    const folderId = await findAppFolderId();
    const existingId = await findFileByName(folderId, filename);

    if (existingId) {
      await driveFetch(
        `${GoogleDriveConfig.UPLOAD_BASE_URL}/files/${encodeURIComponent(existingId)}?uploadType=media`,
        {
          method: "PATCH",
          headers: { "Content-Type": mimeType },
          body: content,
        },
      );
      return;
    }

    const boundary = "commandpad_cloud_sync";
    const metadata = JSON.stringify({ name: filename, parents: [folderId] });
    const body =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n${content}\r\n` +
      `--${boundary}--`;

    await driveFetch(
      `${GoogleDriveConfig.UPLOAD_BASE_URL}/files?uploadType=multipart&fields=id`,
      {
        method: "POST",
        headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
        body,
      },
    );
  }
}

export const googleDriveClient: CloudClient = new GoogleDriveClient();
