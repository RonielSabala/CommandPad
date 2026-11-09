import { CssClass } from "@/common/constants/css";
import { AriaRole, ElementId, ScrollIntoView } from "@/common/constants/dom";
import { Key } from "@/common/constants/events";
import { SearchInput } from "@/components/common/SearchInput";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { useTranslation } from "@/i18n";
import { useStore, useStoreApi } from "@/store/store";
import { toPx } from "@/utils/dom";
import {
  foundRunbooks,
  libraryPath,
  type LibraryRunbookListing,
} from "@/utils/libraryTree";
import { displayLabel } from "@/utils/runbook";
import { classNames } from "@/utils/string";
import {
  memo,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { FileEarmark } from "react-bootstrap-icons";

import { Modal } from "./Modal";
import "./QuickOpenModal.css";

interface RowProps {
  listing: LibraryRunbookListing;
  index: number;
  selected: boolean;
  onOpen: (runbookId: string) => void;
  onHighlight: (index: number) => void;
}

const QuickOpenRow = memo(function QuickOpenRow({
  listing: { runbook, path },
  index,
  selected,
  onOpen,
  onHighlight,
}: RowProps) {
  const t = useTranslation();
  const label = displayLabel(runbook.label, t);

  return (
    <li role={AriaRole.OPTION} aria-selected={selected}>
      <button
        className={classNames(
          "quick-open-row",
          selected && CssClass.IS_SELECTED,
          CssClass.NO_USER_SELECT,
        )}
        tabIndex={-1}
        onClick={() => onOpen(runbook.id)}
        onPointerMove={() => onHighlight(index)}
        {...tooltip(libraryPath([...path, label]))}
      >
        <FileEarmark className={CssClass.ICON_MD} />

        <span className="quick-open-row-label">{label}</span>
        <span className="quick-open-row-path">{libraryPath(path)}</span>
      </button>
    </li>
  );
});

const keepSearchFocused = (event: MouseEvent) => {
  if (!(event.target instanceof HTMLInputElement)) {
    event.preventDefault();
  }
};

function QuickOpenSearch() {
  const t = useTranslation();
  const store = useStoreApi();

  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => {
    const { libraryFolders, libraryRunbooks } = store.getState();
    return foundRunbooks(libraryFolders, libraryRunbooks, query, t);
  }, [store, query, t]);

  // The modal's top edge starts where the tabs bar does
  useLayoutEffect(() => {
    const modal = searchRef.current?.parentElement;
    const bar = document.getElementById(ElementId.TABS_BAR);

    if (modal && bar) {
      modal.style.marginTop = toPx(bar.getBoundingClientRect().top);
    }
  }, []);

  const moveHighlight = (step: number) => {
    const index = (highlighted + step + rows.length) % rows.length;

    setHighlighted(index);
    listRef.current?.children[index]?.scrollIntoView({
      block: ScrollIntoView.BLOCK_NEAREST,
    });
  };

  const openRunbook = useCallback(
    (runbookId: string) => {
      const state = store.getState();

      state.closeQuickOpenModal();
      state.setRunbookFocus(null);
      void state.loadLibraryRunbook(runbookId);
    },
    [store],
  );

  const onKeyDown = (event: KeyboardEvent) => {
    if (rows.length === 0) {
      return;
    }

    if (event.key === Key.ENTER) {
      event.preventDefault();
      openRunbook(rows[highlighted].runbook.id);
    } else if (event.key === Key.ARROW_DOWN) {
      event.preventDefault();
      moveHighlight(1);
    } else if (event.key === Key.ARROW_UP) {
      event.preventDefault();
      moveHighlight(-1);
    }
  };

  return (
    <>
      <div ref={searchRef} onKeyDown={onKeyDown}>
        <SearchInput
          value={query}
          placeholder={t.runbooks.searchPlaceholder}
          onChange={(value) => {
            setQuery(value);
            setHighlighted(0);
            listRef.current?.scrollTo({ top: 0 });
          }}
          autoFocus
        />
      </div>

      {rows.length === 0 ? (
        <p className="quick-open-empty">{t.common.noMatches}</p>
      ) : (
        <ul ref={listRef} className="quick-open-list" role={AriaRole.LISTBOX}>
          {rows.map((listing, index) => (
            <QuickOpenRow
              key={listing.runbook.id}
              listing={listing}
              index={index}
              selected={index === highlighted}
              onOpen={openRunbook}
              onHighlight={setHighlighted}
            />
          ))}
        </ul>
      )}
    </>
  );
}

export function QuickOpenModal() {
  const isOpen = useStore((state) => state.quickOpenModalOpen);
  const closeQuickOpenModal = useStore((state) => state.closeQuickOpenModal);

  // Each opening mounts a fresh search
  const [wasOpen, setWasOpen] = useState(isOpen);
  const [openings, setOpenings] = useState(0);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setOpenings(openings + 1);
    }
  }

  return (
    <Modal
      open={isOpen}
      onClose={closeQuickOpenModal}
      className="modal-quick-open"
      closeButton={false}
      onMouseDown={keepSearchFocused}
      noBackdrop
    >
      {openings > 0 && <QuickOpenSearch key={openings} />}
    </Modal>
  );
}
