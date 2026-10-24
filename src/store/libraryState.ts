import type { RunbookEntry } from "@/common/types";

import type { StoreState } from "./types";

/** Replace one runbook library entry. */
export function withLibraryEntry(
  state: StoreState,
  runbookId: string,
  patch: (entry: RunbookEntry) => RunbookEntry,
): Pick<StoreState, "runbookLibrary"> {
  return {
    runbookLibrary: state.runbookLibrary.map((entry) =>
      entry.id === runbookId ? patch(entry) : entry,
    ),
  };
}
