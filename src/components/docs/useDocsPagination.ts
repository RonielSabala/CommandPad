import {
  DOCS_SECTION_ORDER,
  isDocsSectionId,
  type DocsSectionEntry,
  type DocsSectionId,
} from "@/common/constants/docs";
import { ScrollIntoView } from "@/common/constants/dom";
import { useCallback, useEffect, useState, type RefObject } from "react";

const FIRST_PAGE = DOCS_SECTION_ORDER[0];

export interface DocsPagination {
  entry: DocsSectionEntry;
  previousId: DocsSectionId | null;
  nextId: DocsSectionId | null;
  position: number;
  total: number;
  goTo: (id: DocsSectionId) => void;
}

function linkedPage(): DocsSectionId | null {
  const hash = window.location.hash.replace("#", "");
  return isDocsSectionId(hash) ? hash : null;
}

export function useDocsPagination(
  rootRef: RefObject<HTMLElement | null>,
): DocsPagination {
  const [pageId, setPageId] = useState<DocsSectionId>(
    () => linkedPage() ?? FIRST_PAGE.id,
  );

  const [pendingScroll, setPendingScroll] = useState<boolean | null>(null);

  const goTo = useCallback(
    (id: DocsSectionId) => {
      setPageId(id);
      setPendingScroll(id === pageId);
    },
    [pageId],
  );

  useEffect(() => {
    if (pendingScroll === null) {
      return;
    }

    rootRef.current?.scrollTo({
      top: 0,
      behavior: pendingScroll
        ? ScrollIntoView.BEHAVIOR_SMOOTH
        : ScrollIntoView.BEHAVIOR_INSTANT,
    });

    window.history.replaceState(null, "", `#${pageId}`);
    setPendingScroll(null);
  }, [pendingScroll, pageId, rootRef]);

  const index = DOCS_SECTION_ORDER.findIndex((entry) => entry.id === pageId);

  return {
    entry: DOCS_SECTION_ORDER[index],
    previousId: index > 0 ? DOCS_SECTION_ORDER[index - 1].id : null,
    nextId:
      index < DOCS_SECTION_ORDER.length - 1
        ? DOCS_SECTION_ORDER[index + 1].id
        : null,
    position: index + 1,
    total: DOCS_SECTION_ORDER.length,
    goTo,
  };
}
