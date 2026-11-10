import { LibraryFolderConfig } from "@/common/config";
import type { CSSProperties } from "react";

/** The inline style that indents a library row by its nesting depth. */
export const libraryDepthStyle = (depth: number): CSSProperties | undefined =>
  depth > 0
    ? ({ [LibraryFolderConfig.DEPTH_PROPERTY]: depth } as CSSProperties)
    : undefined;
