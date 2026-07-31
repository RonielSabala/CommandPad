import { createContext } from "react";

export interface SubmenuActivation {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

export const SubmenuActivationContext = createContext<SubmenuActivation | null>(
  null,
);
