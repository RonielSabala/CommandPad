import { AuthResponseParam } from "@/common/config";

function urlParams(part: string): URLSearchParams {
  return new URLSearchParams(part.slice(1));
}

export function isCloudAuthRedirect(): boolean {
  return [window.location.search, window.location.hash]
    .map(urlParams)
    .some(
      (params) =>
        params.has(AuthResponseParam.STATE) &&
        (params.has(AuthResponseParam.CODE) ||
          params.has(AuthResponseParam.ERROR)),
    );
}

export async function completeCloudAuthRedirect(): Promise<boolean> {
  try {
    const { broadcastResponseToMainFrame } =
      await import("@azure/msal-browser/redirect-bridge");

    await broadcastResponseToMainFrame();
    return true;
  } catch (error) {
    console.error("Cloud sign-in redirect could not be relayed", error);
    return false;
  }
}
