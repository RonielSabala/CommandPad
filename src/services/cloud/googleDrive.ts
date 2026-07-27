import {
  CloudSyncConfig,
  CONTENT_TYPE_HEADER,
  contentTypeHeaders,
  GoogleDriveConfig,
  MimeType,
  StorageKey,
} from "@/common/config";
import { CloudProvider, HttpMethod } from "@/common/enums";
import { isBrowsableEntry } from "./entries";
import type { CloudClient, CloudEntry } from "./types";
import { CloudSyncError } from "./types";

const GIS_SCRIPT_URL = "https://accounts.google.com/gsi/client";
const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";

const FILES_URL = `${GoogleDriveConfig.API_BASE_URL}/files`;
const UPLOAD_FILES_URL = `${GoogleDriveConfig.UPLOAD_BASE_URL}/files`;

const TOKEN_EXPIRY_MARGIN_MS = 60_000;

function fileUrl(fileId: string): string {
  return `${FILES_URL}/${encodeURIComponent(fileId)}`;
}

function uploadFileUrl(fileId: string): string {
  return `${UPLOAD_FILES_URL}/${encodeURIComponent(fileId)}`;
}

function escapeQueryValue(value: string): string {
  return value.replace(/(['\\])/g, "\\$1");
}

interface DriveFileResource {
  id: string;
  name: string;
  modifiedTime?: string;
  mimeType?: string;
  size?: string;
}

function toEntry(item: DriveFileResource): CloudEntry {
  return {
    id: item.id,
    name: item.name,
    isFolder: item.mimeType === FOLDER_MIME_TYPE,
    modifiedAt: item.modifiedTime ?? null,
    size: item.size === undefined ? null : Number(item.size),
  };
}

interface StoredGoogleSession {
  accessToken: string;
  accountLabel: string | null;
  expiresAt: number;
}

let scriptPromise: Promise<void> | null = null;
let accessToken: string | null = null;
let accountLabel: string | null = null;
let appFolderId: string | null = null;
let tokenExpiresAt = 0;

function persistSession(): void {
  if (!accessToken) {
    localStorage.removeItem(StorageKey.GOOGLE_SESSION);
    return;
  }

  const session: StoredGoogleSession = {
    accessToken,
    accountLabel,
    expiresAt: tokenExpiresAt,
  };

  localStorage.setItem(StorageKey.GOOGLE_SESSION, JSON.stringify(session));
}

function restoreSession(): void {
  const raw = localStorage.getItem(StorageKey.GOOGLE_SESSION);
  if (!raw) {
    return;
  }

  try {
    const session = JSON.parse(raw) as StoredGoogleSession;
    accessToken = session.accessToken;
    accountLabel = session.accountLabel;
    tokenExpiresAt = session.expiresAt;
  } catch {
    localStorage.removeItem(StorageKey.GOOGLE_SESSION);
  }
}

function clearSession(): void {
  accessToken = null;
  accountLabel = null;
  appFolderId = null;
  tokenExpiresAt = 0;
  localStorage.removeItem(StorageKey.GOOGLE_SESSION);
}

function isTokenFresh(): boolean {
  return (
    accessToken !== null && Date.now() < tokenExpiresAt - TOKEN_EXPIRY_MARGIN_MS
  );
}

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

function requestToken(prompt: string): Promise<GoogleTokenResponse> {
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
          resolve(response);
        },
        error_callback: () => {
          reject(new CloudSyncError("Google sign-in was cancelled"));
        },
      });

      client.requestAccessToken({ prompt });
    });
  });
}

function applyToken(response: GoogleTokenResponse): void {
  accessToken = response.access_token;
  tokenExpiresAt = Date.now() + response.expires_in * 1000;
  persistSession();
}

async function ensureToken(): Promise<void> {
  if (isTokenFresh()) {
    return;
  }

  if (!accessToken) {
    throw new CloudSyncError("Not signed in to Google Drive");
  }

  try {
    applyToken(await requestToken(""));
  } catch (error) {
    clearSession();
    throw error instanceof CloudSyncError
      ? error
      : new CloudSyncError("Google session expired; sign in again");
  }
}

async function driveFetch(url: string, init?: RequestInit): Promise<Response> {
  await ensureToken();

  const response = await fetch(url, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new CloudSyncError(
      `Google Drive request failed (${response.status})`,
    );
  }

  return response;
}

async function findAppFolderId(): Promise<string> {
  if (appFolderId) {
    return appFolderId;
  }

  const query = encodeURIComponent(
    `mimeType='${FOLDER_MIME_TYPE}' and name='${escapeQueryValue(CloudSyncConfig.APP_FOLDER_NAME)}' and 'root' in parents and trashed=false`,
  );
  const searchResponse = await driveFetch(
    `${FILES_URL}?q=${query}&fields=files(id,name)&spaces=drive`,
  );
  const searchData = (await searchResponse.json()) as {
    files: { id: string }[];
  };

  if (searchData.files.length > 0) {
    appFolderId = searchData.files[0].id;
    return appFolderId;
  }

  const createResponse = await driveFetch(`${FILES_URL}?fields=id`, {
    method: HttpMethod.POST,
    headers: contentTypeHeaders(MimeType.JSON),
    body: JSON.stringify({
      name: CloudSyncConfig.APP_FOLDER_NAME,
      mimeType: FOLDER_MIME_TYPE,
    }),
  });

  const created = (await createResponse.json()) as { id: string };
  appFolderId = created.id;
  return appFolderId;
}

async function resolveFolderId(folderId: string | null): Promise<string> {
  return folderId ?? (await findAppFolderId());
}

async function findFileByName(
  folderId: string,
  filename: string,
): Promise<string | null> {
  const query = encodeURIComponent(
    `'${escapeQueryValue(folderId)}' in parents and name='${escapeQueryValue(filename)}' and trashed=false`,
  );
  const response = await driveFetch(
    `${FILES_URL}?q=${query}&fields=files(id)&spaces=drive`,
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

    if (!accessToken) {
      restoreSession();
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
    applyToken(await requestToken("consent"));

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

    persistSession();
  }

  async signOut(): Promise<void> {
    if (accessToken && window.google) {
      window.google.accounts.oauth2.revoke(accessToken, () => {});
    }

    clearSession();
  }

  async listEntries(folderId: string | null): Promise<CloudEntry[]> {
    const parentId = await resolveFolderId(folderId);
    const query = encodeURIComponent(
      `'${escapeQueryValue(parentId)}' in parents and trashed=false`,
    );
    const response = await driveFetch(
      `${FILES_URL}?q=${query}&fields=files(id,name,mimeType,modifiedTime,size)&orderBy=modifiedTime desc&spaces=drive`,
    );

    const data = (await response.json()) as { files: DriveFileResource[] };
    return data.files.map(toEntry).filter(isBrowsableEntry);
  }

  async createFolder(
    name: string,
    parentId: string | null,
  ): Promise<CloudEntry> {
    const folderId = await resolveFolderId(parentId);
    const response = await driveFetch(
      `${FILES_URL}?fields=id,name,mimeType,modifiedTime`,
      {
        method: HttpMethod.POST,
        headers: contentTypeHeaders(MimeType.JSON),
        body: JSON.stringify({
          name,
          mimeType: FOLDER_MIME_TYPE,
          parents: [folderId],
        }),
      },
    );

    return toEntry((await response.json()) as DriveFileResource);
  }

  async fileExists(
    filename: string,
    folderId: string | null,
  ): Promise<boolean> {
    const parentId = await resolveFolderId(folderId);
    return (await findFileByName(parentId, filename)) !== null;
  }

  async readFile(file: CloudEntry): Promise<string> {
    const response = await driveFetch(`${fileUrl(file.id)}?alt=media`);
    return response.text();
  }

  async writeFile(
    filename: string,
    content: string,
    mimeType: string,
    targetFolderId: string | null,
  ): Promise<void> {
    const folderId = await resolveFolderId(targetFolderId);
    const existingId = await findFileByName(folderId, filename);

    if (existingId) {
      await driveFetch(`${uploadFileUrl(existingId)}?uploadType=media`, {
        method: HttpMethod.PATCH,
        headers: contentTypeHeaders(mimeType),
        body: content,
      });

      return;
    }

    const boundary = "commandpad_cloud_sync";
    const metadata = JSON.stringify({ name: filename, parents: [folderId] });
    const body =
      `--${boundary}\r\n` +
      `${CONTENT_TYPE_HEADER}: ${MimeType.JSON}; charset=UTF-8\r\n\r\n${metadata}\r\n` +
      `--${boundary}\r\n` +
      `${CONTENT_TYPE_HEADER}: ${mimeType}\r\n\r\n${content}\r\n` +
      `--${boundary}--`;

    await driveFetch(`${UPLOAD_FILES_URL}?uploadType=multipart&fields=id`, {
      method: HttpMethod.POST,
      headers: contentTypeHeaders(`multipart/related; boundary=${boundary}`),
      body,
    });
  }

  async renameEntry(entry: CloudEntry, name: string): Promise<void> {
    await driveFetch(fileUrl(entry.id), {
      method: HttpMethod.PATCH,
      headers: contentTypeHeaders(MimeType.JSON),
      body: JSON.stringify({ name }),
    });
  }

  async deleteEntry(entry: CloudEntry): Promise<void> {
    await driveFetch(fileUrl(entry.id), { method: HttpMethod.DELETE });
  }
}

export const googleDriveClient: CloudClient = new GoogleDriveClient();
