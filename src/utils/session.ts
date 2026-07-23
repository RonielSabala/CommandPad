import { StorageKey } from "@/common/config";

export function markHomeVisited(): void {
  try {
    localStorage.setItem(StorageKey.VISITED_HOME, "true");
  } catch {
    // Ignore
  }
}

export function hasVisitedHome(): boolean {
  try {
    return localStorage.getItem(StorageKey.VISITED_HOME) === "true";
  } catch {
    return false;
  }
}
