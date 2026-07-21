import type { CloudProvider } from "@/common/enums";

/** A runbook JSON file inside the provider's CommandPad app folder. */
export interface CloudFile {
  id: string;
  name: string;
  modifiedAt: string | null;
}

/**
 * Thrown for user-facing cloud sync failures (auth, network, not configured).
 * `message` is shown as-is in the Cloud modal, so keep it short and translated
 * via the caller when possible.
 */
export class CloudSyncError extends Error {}

/**
 * A minimal, provider-agnostic client for storing/retrieving runbook JSON
 * files in one dedicated app folder in the signed-in account's own storage.
 * Implemented per provider (SharePoint/OneDrive via Microsoft Graph, Google
 * Drive via the Drive REST API) so the store/UI never touch provider SDKs.
 */
export interface CloudClient {
  readonly provider: CloudProvider;

  /** Whether a Client ID was supplied at build time for this provider. */
  isConfigured(): boolean;

  /**
   * Performs one-time async setup (loading the provider SDK, restoring a
   * cached session) so that `isSignedIn`/`getAccountLabel` are accurate
   * afterwards. Safe to call repeatedly; the underlying work only runs once.
   */
  init(): Promise<void>;

  /** Whether there is currently a usable, signed-in session. */
  isSignedIn(): boolean;

  /** Short label (email/name) for the signed-in account, if any. */
  getAccountLabel(): string | null;

  signIn(): Promise<void>;
  signOut(): Promise<void>;

  /** Lists the re-importable (JSON) runbook files in the app folder, newest first. */
  listFiles(): Promise<CloudFile[]>;

  readFile(file: CloudFile): Promise<string>;

  /** Creates or overwrites `filename` in the app folder with `content`. */
  writeFile(filename: string, content: string, mimeType: string): Promise<void>;
}
