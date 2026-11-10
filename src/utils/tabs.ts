import type { Tab } from "@/common/types";

export function findTabById(
  tabs: readonly Tab[],
  tabId: string | null,
): Tab | undefined {
  return tabs.find((tab) => tab.id === tabId);
}

export function findTabByRunbookId(
  tabs: readonly Tab[],
  runbookId: string,
): Tab | undefined {
  return tabs.find((tab) => tab.runbookId === runbookId);
}
