import {
  getDocsSectionParents,
  type DocsSectionId,
} from "@/common/constants/docs";
import { useCallback, useState } from "react";

const SECTION_PARENTS = getDocsSectionParents();
const PARENT_IDS = new Set(
  Object.values(SECTION_PARENTS).filter(
    (id): id is DocsSectionId => id !== null,
  ),
);

export interface DocsCollapse {
  isCollapsed: (id: DocsSectionId) => boolean;
  isVisible: (id: DocsSectionId) => boolean;
  hasChildren: (id: DocsSectionId) => boolean;
  toggle: (id: DocsSectionId) => void;
  allCollapsed: boolean;
  toggleAll: () => void;
}

export function useDocsCollapse(): DocsCollapse {
  const [collapsed, setCollapsed] = useState<ReadonlySet<DocsSectionId>>(
    () => new Set(),
  );

  const isCollapsed = useCallback(
    (id: DocsSectionId) => collapsed.has(id),
    [collapsed],
  );
  const isVisible = useCallback(
    (id: DocsSectionId) => {
      const parent = SECTION_PARENTS[id];
      return parent === null || !collapsed.has(parent);
    },
    [collapsed],
  );
  const hasChildren = useCallback(
    (id: DocsSectionId) => PARENT_IDS.has(id),
    [],
  );

  const toggle = useCallback((id: DocsSectionId) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (!next.delete(id)) {
        next.add(id);
      }

      return next;
    });
  }, []);

  // Only a parent has rows to fold, so only a parent counts as collapsed
  const allCollapsed = collapsed.size === PARENT_IDS.size;

  const toggleAll = useCallback(() => {
    setCollapsed((current) =>
      current.size === PARENT_IDS.size ? new Set() : new Set(PARENT_IDS),
    );
  }, []);

  return {
    isCollapsed,
    isVisible,
    hasChildren,
    toggle,
    allCollapsed,
    toggleAll,
  };
}
