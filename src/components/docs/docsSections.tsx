import type { DocsSectionId } from "@/common/constants/docs";
import type { ComponentType } from "react";

// Content rendered below each numbered section heading; sections without
// an entry render heading-only. Filled in per-section under ./sections/.
export const DOCS_SECTION_CONTENT: Partial<
  Record<DocsSectionId, ComponentType>
> = {};
