import { StorageKey } from "@/common/config";

/**
 * The landing page is shown until the user explicitly enters the app (clicks an
 * "Open app" / "Open CommandPad" button). After that, opening the app again
 * (even in a new window) skips straight to the workspace. Stored in
 * localStorage so it survives closing the window; a full reset clears it.
 */
export function markHomeVisited(): void {
  try {
    localStorage.setItem(StorageKey.VISITED_HOME, "true");
  } catch {
    // localStorage can be unavailable (private mode, disabled); ignore.
  }
}

export function hasVisitedHome(): boolean {
  try {
    return localStorage.getItem(StorageKey.VISITED_HOME) === "true";
  } catch {
    return false;
  }
}
