import type { CloudEntry } from "@/services/cloud";
import { createContext, useContext } from "react";

export interface CloudSelectionModifiers {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

export interface CloudSelectionApi {
  rows: CloudEntry[];
  select: (id: string, modifiers: CloudSelectionModifiers) => void;
  toggle: (id: string) => void;
}

const FALLBACK: CloudSelectionApi = {
  rows: [],
  select: () => {},
  toggle: () => {},
};

export const CloudSelectionContext = createContext<CloudSelectionApi>(FALLBACK);

export function useCloudSelection(): CloudSelectionApi {
  return useContext(CloudSelectionContext);
}
