import { CssClass } from "@/common/constants/css";
import { Anchor, DataAttr, HtmlTag } from "@/common/constants/dom";
import { AppMode, NoteNodeType, NoteSegmentType } from "@/common/enums";
import { formatBinding, KeyBinding, KEYBINDINGS } from "@/common/keybindings";
import type { NoteSegment, NoteTable, NoteTableCell } from "@/common/types";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { parseNoteNodes } from "@/utils/markdown";
import "./NoteText.css";

interface SegmentsProps {
  segments: NoteSegment[];
  requiresLinkModifier?: boolean;
}

function NoteSegments({ segments, requiresLinkModifier }: SegmentsProps) {
  const t = useTranslation();
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const followLinkTooltip = t.note.followLinkTooltip(
    requiresLinkModifier && !readMode
      ? formatBinding(KEYBINDINGS[KeyBinding.OPEN_LINK].binding)
      : undefined,
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
  requiresLinkModifier,
}: {
  cells: NoteTableCell[];
  header?: boolean;
  requiresLinkModifier?: boolean;
}) {
  const Cell = header ? HtmlTag.TABLE_HEADER_CELL : HtmlTag.TABLE_CELL;

  return (
    <tr>
      {cells.map((cell, i) => (
        <Cell key={i} {...{ [DataAttr.NOTE_ALIGN]: cell.align }}>
          <NoteSegments
            segments={cell.segments}
            requiresLinkModifier={requiresLinkModifier}
          />
        </Cell>
      ))}
    </tr>
  );
}

function NoteTableView({
  table,
  requiresLinkModifier,
}: {
  table: NoteTable;
  requiresLinkModifier?: boolean;
}) {
  return (
    <table className="note-table">
      <thead>
        <NoteTableRow
          cells={table.head}
          header
          requiresLinkModifier={requiresLinkModifier}
        />
      </thead>
      <tbody>
        {table.rows.map((row, i) => (
          <NoteTableRow
            key={i}
            cells={row}
            requiresLinkModifier={requiresLinkModifier}
          />
        ))}
      </tbody>
    </table>
  );
}

interface NoteTextProps {
  text: string;
  requiresLinkModifier?: boolean;
}

export function NoteText({ text, requiresLinkModifier }: NoteTextProps) {
  return (
    <>
      {parseNoteNodes(text).map((node, i) =>
        node.type === NoteNodeType.TABLE ? (
          <NoteTableView
            key={i}
            table={node.table}
            requiresLinkModifier={requiresLinkModifier}
          />
        ) : (
          <NoteSegments
            key={i}
            segments={node.segments}
            requiresLinkModifier={requiresLinkModifier}
          />
        ),
      )}
    </>
  );
}
