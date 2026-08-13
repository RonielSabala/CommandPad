import { CodeRendering } from "@/common/enums";
import { createContext, useContext } from "react";

const CodeRenderingContext = createContext<CodeRendering>(CodeRendering.LIVE);
export const CodeRenderingProvider = CodeRenderingContext.Provider;

export function useCodeRendering(): CodeRendering {
  return useContext(CodeRenderingContext);
}
