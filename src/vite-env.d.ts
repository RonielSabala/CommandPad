/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Client (application) ID of the Entra ID "SPA" app registration used for SharePoint/OneDrive sync. */
  readonly VITE_MSAL_CLIENT_ID?: string;
  /** Entra ID tenant id to restrict sign-in to a single organization. Defaults to "common" (any account). */
  readonly VITE_MSAL_TENANT_ID?: string;
  /** OAuth 2.0 Client ID of the Google Cloud "Web application" credential used for Google Drive sync. */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
