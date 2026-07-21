// Minimal ambient types for the parts of Google Identity Services (GIS) this
// app uses. GIS is loaded at runtime via a <script> tag (see googleDrive.ts),
// there is no official npm package for it.

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  error?: string;
}

interface GoogleTokenClient {
  requestAccessToken(overrideConfig?: { prompt?: string }): void;
}

interface GoogleTokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (error: { type: string; message?: string }) => void;
}

interface Window {
  google?: {
    accounts: {
      oauth2: {
        initTokenClient(config: GoogleTokenClientConfig): GoogleTokenClient;
        revoke(accessToken: string, callback: () => void): void;
      };
    };
  };
}
