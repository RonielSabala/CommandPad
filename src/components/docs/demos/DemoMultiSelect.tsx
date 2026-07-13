import { BlockType } from "@/common/enums";
import { KeyBinding, matchesKeybinding } from "@/common/keybindings";
import { NoteText } from "@/components/blocks/note/NoteText";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";
import { useRef, useState, type KeyboardEvent } from "react";
import "@/components/blocks/BlockItem.css";
import "@/components/blocks/command/CommandBlock.css";
import "@/components/blocks/note/NoteBlock.css";
import { DocsDemo } from "./DocsDemo";

type DemoBlockType = typeof BlockType.COMMAND | typeof BlockType.NOTE;

interface DemoBlock {
  id: number;
  type: DemoBlockType;
  text: string;
}

// Multi-select playground: shift+click builds a selection, Ctrl+D
// duplicates it, Del deletes it, Escape clears it, all on local state
export function DemoMultiSelect() {
  const t = useTranslation();
  const nextId = useRef(100);

  const seed = (): DemoBlock[] => [
    { id: 0, type: BlockType.NOTE, text: t.docs.demo.multiSelectNotes[0] },
    { id: 1, type: BlockType.COMMAND, text: "docker compose up -d" },
    { id: 2, type: BlockType.COMMAND, text: "docker compose logs -f api" },
    { id: 3, type: BlockType.NOTE, text: t.docs.demo.multiSelectNotes[1] },
    { id: 4, type: BlockType.COMMAND, text: "docker compose down" },
  ];

  const [blocks, setBlocks] = useState<DemoBlock[]>(seed);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  );

  const toggleSelection = (id: number) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const duplicateSelection = () => {
    if (selectedIds.size === 0) {
      return;
    }

    setBlocks((current) => {
      const copies = current
        .filter((block) => selectedIds.has(block.id))
        .map((block) => ({ ...block, id: nextId.current++ }));
      const lastIndex = current.reduce(
        (last, block, index) => (selectedIds.has(block.id) ? index : last),
        -1,
      );

      const next = [...current];
      next.splice(lastIndex + 1, 0, ...copies);
      return next;
    });
  };

  const deleteSelection = () => {
    if (selectedIds.size === 0) {
      return;
    }

    setBlocks((current) =>
      current.filter((block) => !selectedIds.has(block.id)),
    );
    setSelectedIds(new Set());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (matchesKeybinding(event.nativeEvent, KeyBinding.DUPLICATE_BLOCK)) {
      event.preventDefault();
      duplicateSelection();
    } else if (matchesKeybinding(event.nativeEvent, KeyBinding.DELETE_BLOCK)) {
      event.preventDefault();
      deleteSelection();
    } else if (matchesKeybinding(event.nativeEvent, KeyBinding.ESCAPE)) {
      setSelectedIds(new Set());
    }
  };

  const reset = () => {
    setBlocks(seed());
    setSelectedIds(new Set());
  };

  return (
    <DocsDemo onReset={reset}>
      <div
        className="docs-demo-multiselect"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {blocks.map((block) => (
          <div
            key={block.id}
            className={classNames(
              "block-item",
              "docs-demo-multiselect-block",
              selectedIds.has(block.id) && "block-selected",
            )}
            onClick={(event) => {
              if (event.shiftKey) {
                toggleSelection(block.id);
              }
            }}
          >
            {block.type === BlockType.COMMAND ? (
              <div className="command-block">
                <div className="command-preview">
                  <span className="command-preview-text">
                    <span className="token-resolved">{block.text}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="note-block">
                <div className="note-preview">
                  <NoteText text={block.text} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </DocsDemo>
  );
}
