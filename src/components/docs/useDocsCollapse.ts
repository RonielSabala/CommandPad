import {
  DOCS_SECTION_ORDER,
  getDocsSectionParents,
  type DocsSectionId,
} from "@/common/constants/docs";
import { useCallback, useMemo, useState } from "react";

const SECTION_PARENTS = getDocsSectionParents();
const SECTION_IDS = DOCS_SECTION_ORDER.map((entry) => entry.id);
const PARENT_IDS = new Set(
  Object.values(SECTION_PARENTS).filter(
    (id): id is DocsSectionId => id !== null,
  ),
);

export interface DocsCollapse {
  isArticleCollapsed: (id: DocsSectionId) => boolean;
  isArticleVisible: (id: DocsSectionId) => boolean;
  toggleArticle: (id: DocsSectionId) => void;
  isNavCollapsed: (id: DocsSectionId) => boolean;
  isNavVisible: (id: DocsSectionId) => boolean;
  hasChildren: (id: DocsSectionId) => boolean;
  activateFromToc: (id: DocsSectionId) => void;
  toggleNav: (id: DocsSectionId) => void;
  allCollapsed: boolean;
  toggleAll: () => void;
  visibleIds: readonly DocsSectionId[];
}

export function useDocsCollapse(): DocsCollapse {
  const [articleCollapsed, setArticleCollapsed] = useState<
    ReadonlySet<DocsSectionId>
  >(() => new Set());

  const [navCollapsed, setNavCollapsed] = useState<ReadonlySet<DocsSectionId>>(
    () => new Set(),
  );

  const isArticleCollapsed = useCallback(
    (id: DocsSectionId) => articleCollapsed.has(id),
    [articleCollapsed],
  );

  const isArticleVisible = useCallback(
    (id: DocsSectionId) => {
      const parent = SECTION_PARENTS[id];
      return parent === null || !articleCollapsed.has(parent);
    },
    [articleCollapsed],
  );

  const toggleArticle = useCallback((id: DocsSectionId) => {
    setArticleCollapsed((current) => {
      const next = new Set(current);
      if (!next.delete(id)) {
        next.add(id);
      }

      return next;
    });
  }, []);

  const isNavCollapsed = useCallback(
    (id: DocsSectionId) => navCollapsed.has(id),
    [navCollapsed],
  );

  const isNavVisible = useCallback(
    (id: DocsSectionId) => {
      const parent = SECTION_PARENTS[id];
      return parent === null || !navCollapsed.has(parent);
    },
    [navCollapsed],
  );

  const hasChildren = useCallback(
    (id: DocsSectionId) => PARENT_IDS.has(id),
    [],
  );

  const toggleNav = useCallback((id: DocsSectionId) => {
    setNavCollapsed((current) => {
      const next = new Set(current);
      if (!next.delete(id)) {
        next.add(id);
      }

      return next;
    });
  }, []);

  const activateFromToc = useCallback((id: DocsSectionId) => {
    setArticleCollapsed((current) => {
      const parent = SECTION_PARENTS[id];
      if (!current.has(id) && (parent === null || !current.has(parent))) {
        return current;
      }

      const next = new Set(current);
      next.delete(id);
      if (parent !== null) {
        next.delete(parent);
      }

      return next;
    });
  }, []);

  const allCollapsed = articleCollapsed.size === SECTION_IDS.length;

  const toggleAll = useCallback(() => {
    setArticleCollapsed((current) => {
      const collapsing = current.size !== SECTION_IDS.length;
      setNavCollapsed(collapsing ? new Set(SECTION_IDS) : new Set());

      return collapsing ? new Set(SECTION_IDS) : new Set();
    });
  }, []);

  const visibleIds = useMemo(
    () => SECTION_IDS.filter((id) => isArticleVisible(id)),
    [isArticleVisible],
  );

  return {
    isArticleCollapsed,
    isArticleVisible,
    toggleArticle,
    isNavCollapsed,
    isNavVisible,
    hasChildren,
    activateFromToc,
    toggleNav,
    allCollapsed,
    toggleAll,
    visibleIds,
  };
}
