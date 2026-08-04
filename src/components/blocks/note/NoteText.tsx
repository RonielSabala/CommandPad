import { CssClass } from "@/common/constants/css";
import { Anchor, DataAttr } from "@/common/constants/dom";
import { AppMode, NoteNodeType, NoteSegmentType } from "@/common/enums";
import { formatBinding, KeyBinding, KEYBINDINGS } from "@/common/keybindings";
import type { NoteSegment, NoteTable, NoteTableCell } from "@/common/types";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { parseNoteNodes } from "@/utils/markdown";
import "./NoteText.css";

interface Props {
  text: string;
}

function NoteSegments({ segments }: { segments: NoteSegment[] }) {
  const t = useTranslation();
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const followLinkTooltip = t.note.followLinkTooltip(
    readMode
      ? undefined
      : formatBinding(KEYBINDINGS[KeyBinding.OPEN_LINK].binding),
  );

  return (
    <>
      {segments.map((segment, i) => {
        switch (segment.type) {
          case NoteSegmentType.BOLD:
            return (
              <span key={i} className="note-bold">
                {segment.text}
              </span>
            );
          case NoteSegmentType.ITALIC:
            return (
              <span key={i} className="note-italic">
                {segment.text}
              </span>
            );
          case NoteSegmentType.CODE:
            return (
              <span key={i} className="note-code">
                {segment.text}
              </span>
            );
          case NoteSegmentType.LINK:
            return (
              <a
                key={i}
                href={segment.href ?? segment.text}
                className={CssClass.NOTE_LINK}
                target={Anchor.TARGET_BLANK}
                rel={Anchor.REL}
                title={followLinkTooltip}
                {...{ [DataAttr.NOTE_OFFSET]: segment.start }}
              >
                {segment.text}
              </a>
            );
          default:
            return segment.text;
        }
      })}
    </>
  );
}

function NoteTableRow({
  cells,
  header,
}: {
  cells: NoteTableCell[];
  header?: boolean;
}) {
  const Cell = header ? "th" : "td";

  return (
    <tr>
      {cells.map((cell, i) => (
        <Cell key={i} {...{ [DataAttr.NOTE_ALIGN]: cell.align }}>
          <NoteSegments segments={cell.segments} />
        </Cell>
      ))}
    </tr>
  );
}

function NoteTableView({ table }: { table: NoteTable }) {
  return (
    <table className="note-table">
      <thead>
        <NoteTableRow cells={table.head} header />
      </thead>
      <tbody>
        {table.rows.map((row, i) => (
          <NoteTableRow key={i} cells={row} />
        ))}
      </tbody>
    </table>
  );
}

export function NoteText({ text }: Props) {
  return (
    <>
      {parseNoteNodes(text).map((node, i) =>
        node.type === NoteNodeType.TABLE ? (
          <NoteTableView key={i} table={node.table} />
        ) : (
          <NoteSegments key={i} segments={node.segments} />
        ),
      )}
    </>
  );
}
