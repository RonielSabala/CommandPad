import type { CloudProvider } from "@/common/enums";

export interface CloudFile {
  id: string;
  name: string;
  modifiedAt: string | null;
  size: number | null;
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

  listFiles(): Promise<CloudFile[]>;
  readFile(file: CloudFile): Promise<string>;
  writeFile(filename: string, content: string, mimeType: string): Promise<void>;
  renameFile(file: CloudFile, filename: string): Promise<void>;
  deleteFile(file: CloudFile): Promise<void>;
}
