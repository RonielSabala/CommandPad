import { StorageKey } from "@/common/config";
import { isDocsSectionId, type DocsSectionId } from "@/common/constants/docs";

import { isString } from "./typeGuards";

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

export function rememberDocsPage(id: DocsSectionId): void {
  try {
    localStorage.setItem(StorageKey.DOCS_PAGE, id);
  } catch {
    // Ignore
  }
}

export function rememberedDocsPage(): DocsSectionId | null {
  try {
    const id = localStorage.getItem(StorageKey.DOCS_PAGE);
    return id && isDocsSectionId(id) ? id : null;
  } catch {
    return null;
  }
}

export function rememberDocsCollapsed(ids: Iterable<DocsSectionId>): void {
  try {
    localStorage.setItem(StorageKey.DOCS_COLLAPSED, JSON.stringify([...ids]));
  } catch {
    // Ignore
  }
}

export function rememberedDocsCollapsed(): DocsSectionId[] {
  try {
    const ids: unknown = JSON.parse(
      localStorage.getItem(StorageKey.DOCS_COLLAPSED) ?? "[]",
    );

    return Array.isArray(ids)
      ? ids.filter(
          (id): id is DocsSectionId => isString(id) && isDocsSectionId(id),
        )
      : [];
  } catch {
    return [];
  }
}
