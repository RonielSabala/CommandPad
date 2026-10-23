import type { RunbookContent } from "@/common/types";
import { decryptContent, encryptContent } from "@/services/vault";
import type { StoreApi } from "zustand";

import * as persistence from "./persistence";
import {
  deleteRunbookContent,
  getRunbookContent,
  putRunbookContent,
} from "./runbookDb";
import type { StoreState } from "./types";

export interface AppStoreOptions {
  isDemo?: boolean;
  /** Pre-seeded runbook content for demo stores, keyed by runbook id */
  contentSeed?: Record<string, RunbookContent>;
}

export type PersistenceWrites = Pick<
  typeof persistence,
  "saveTabsMeta" | "saveRunbookLibrary" | "saveUiState" | "saveSidebarSections"
>;

export const NOOP_PERSISTENCE: PersistenceWrites = {
  saveTabsMeta: () => {},
  saveRunbookLibrary: () => {},
  saveUiState: () => {},
  saveSidebarSections: () => {},
};

export interface ContentDb {
  get: (id: string) => Promise<RunbookContent | null>;
  put: (id: string, content: RunbookContent) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

export const REAL_CONTENT_DB: ContentDb = {
  get: async (id) => {
    const stored = await getRunbookContent(id);
    return stored ? (await decryptContent(id, stored)).content : null;
  },
  put: async (id, content) =>
    putRunbookContent(id, await encryptContent(id, content)),
  delete: deleteRunbookContent,
};

export function createMemoryContentDb(
  seed: Record<string, RunbookContent> = {},
): ContentDb {
  const contents = new Map(Object.entries(seed));
  return {
    get: async (id) => contents.get(id) ?? null,
    put: async (id, content) => {
      contents.set(id, content);
    },
    delete: async (id) => {
      contents.delete(id);
    },
  };
}

/** What every slice and service closes over, built once per store. */
export interface StoreKit {
  set: StoreApi<StoreState>["setState"];
  get: StoreApi<StoreState>["getState"];
  isDemo: boolean;
  persist: PersistenceWrites;
  contentDb: ContentDb;
  debouncedSaveState: () => void;
}
