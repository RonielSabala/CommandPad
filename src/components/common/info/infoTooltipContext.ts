import { createContext } from "react";

/** Closes the info bubble the content is shown in. */
export const InfoDismissContext = createContext<() => void>(() => {});
