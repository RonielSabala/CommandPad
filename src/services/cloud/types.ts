import type { CloudProvider } from "@/common/enums";

/** A file or folder inside the app folder tree. */
export interface CloudEntry {
  id: string;
  name: string;
  isFolder: boolean;
  modifiedAt: string | null;
  size: number | null;
}

/** One step of a folder trail; an empty trail means the app root folder. */
export interface CloudFolderRef {
  id: string;
  name: string;
}

export class CloudSyncError extends Error {}

export interface CloudClient {
  readonly provider: CloudProvider;

  /** Whether a Client ID was supplied at build time for this provider. */
  isConfigured(): boolean;

  /** One-time async setup */
  init(): Promise<void>;

  /** Whether there is currently a usable, signed-in session. */
  isSignedIn(): boolean;

  /** Short label for the signed-in account, if any. */
  getAccountLabel(): string | null;

  signIn(): Promise<void>;
  signOut(): Promise<void>;

  listEntries(folderId: string | null): Promise<CloudEntry[]>;
  createFolder(name: string, parentId: string | null): Promise<void>;
  readFile(file: CloudEntry): Promise<string>;
  writeFile(
    filename: string,
    content: string,
    mimeType: string,
    folderId: string | null,
  ): Promise<void>;
  renameFile(file: CloudEntry, filename: string): Promise<void>;
  deleteFile(file: CloudEntry): Promise<void>;
}
