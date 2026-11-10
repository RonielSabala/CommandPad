import { QuickOpenConfig } from "@/common/config";
import { AriaRole, ElementId, ScrollIntoView } from "@/common/constants/dom";
import { Key } from "@/common/constants/events";
import { SearchInput } from "@/components/common/SearchInput";
import { useTranslation } from "@/i18n";
import { useStore, useStoreApi } from "@/store/store";
import { toPx } from "@/utils/dom";
import { foundRunbooks } from "@/utils/libraryTree";
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import { Modal } from "../Modal";
import {
  availableCommands,
  commandSearch,
  foundCommands,
  PALETTE_COMMANDS,
} from "./paletteCommands";
import "./QuickOpenModal.css";
import { QuickOpenCommandRow, QuickOpenRunbookRow } from "./QuickOpenRows";

const keepSearchFocused = (event: MouseEvent) => {
  if (!(event.target instanceof HTMLInputElement)) {
    event.preventDefault();
  }
};

function QuickOpenSearch({ initialQuery }: { initialQuery: string }) {
  const t = useTranslation();
  const store = useStoreApi();

  const [query, setQuery] = useState(initialQuery);
  const [highlighted, setHighlighted] = useState(0);

  // Neither changes while the search is open
  const [recentIds] = useState(() => store.getState().recentRunbookIds);
  const [commands] = useState(() => availableCommands(store.getState()));

  const listRef = useRef<HTMLUListElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const search = commandSearch(query);
  const listings = useMemo(() => {
    if (search !== null) {
      return [];
    }

    const { libraryFolders, libraryRunbooks } = store.getState();
    return foundRunbooks(libraryFolders, libraryRunbooks, query, t, recentIds);
  }, [store, search, query, t, recentIds]);

  const matchedCommands = useMemo(
    () => (search === null ? [] : foundCommands(commands, search, t)),
    [commands, search, t],
  );

  const rowCount = search === null ? listings.length : matchedCommands.length;

  // The modal's top edge starts where the tabs bar does
  useLayoutEffect(() => {
    const modal = searchRef.current?.parentElement;
    const bar = document.getElementById(ElementId.TABS_BAR);

    if (modal && bar) {
      modal.style.marginTop = toPx(bar.getBoundingClientRect().top);
    }
  }, []);

  const moveHighlight = (step: number) => {
    const index = (highlighted + step + rowCount) % rowCount;

    setHighlighted(index);
    listRef.current?.children[index]?.scrollIntoView({
      block: ScrollIntoView.BLOCK_NEAREST,
    });
  };

  const activate = useCallback(
    (index: number) => {
      const state = store.getState();
      state.closeQuickOpenModal();

      if (search !== null) {
        PALETTE_COMMANDS[matchedCommands[index]].run(state);
        return;
      }

      state.setRunbookFocus(null);
      void state.loadLibraryRunbook(listings[index].runbook.id);
    },
    [store, search, listings, matchedCommands],
  );

  const onKeyDown = (event: KeyboardEvent) => {
    if (rowCount === 0) {
      return;
    }

    if (event.key === Key.ENTER) {
      event.preventDefault();
      activate(highlighted);
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
          placeholder={t.quickOpen.placeholder(QuickOpenConfig.COMMAND_PREFIX)}
          onChange={(value) => {
            setQuery(value);
            setHighlighted(0);
            listRef.current?.scrollTo({ top: 0 });
          }}
          autoFocus
        />
      </div>

      {rowCount === 0 ? (
        <p className="quick-open-empty">{t.common.noMatches}</p>
      ) : (
        <ul ref={listRef} className="quick-open-list" role={AriaRole.LISTBOX}>
          {search === null
            ? listings.map((listing, index) => (
                <QuickOpenRunbookRow
                  key={listing.runbook.id}
                  listing={listing}
                  recent={recentIds.includes(listing.runbook.id)}
                  index={index}
                  selected={index === highlighted}
                  onActivate={activate}
                  onHighlight={setHighlighted}
                />
              ))
            : matchedCommands.map((command, index) => (
                <QuickOpenCommandRow
                  key={command}
                  command={command}
                  index={index}
                  selected={index === highlighted}
                  onActivate={activate}
                  onHighlight={setHighlighted}
                />
              ))}
        </ul>
      )}
    </>
  );
}

export function QuickOpenModal() {
  const requested = useStore((state) => state.quickOpenQuery);
  const closeQuickOpenModal = useStore((state) => state.closeQuickOpenModal);

  // Each opening mounts a fresh search
  const [lastRequested, setLastRequested] = useState(requested);
  const [shown, setShown] = useState({ query: "", openings: 0 });

  if (requested !== lastRequested) {
    setLastRequested(requested);
    if (requested !== null) {
      setShown({ query: requested, openings: shown.openings + 1 });
    }
  }

  return (
    <Modal
      open={requested !== null}
      onClose={closeQuickOpenModal}
      className="modal-quick-open"
      closeButton={false}
      onMouseDown={keepSearchFocused}
      noBackdrop
    >
      {shown.openings > 0 && (
        <QuickOpenSearch key={shown.openings} initialQuery={shown.query} />
      )}
    </Modal>
  );
}
