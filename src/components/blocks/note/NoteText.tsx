import { CssClass } from "@/common/constants/css";
import { Anchor, DataAttr, HtmlTag } from "@/common/constants/dom";
import { AppMode, NoteNodeType, NoteSegmentType } from "@/common/enums";
import { formatBinding, KeyBinding, KEYBINDINGS } from "@/common/keybindings";
import type { NoteSegment, NoteTable, NoteTableCell } from "@/common/types";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { parseNoteNodes } from "@/utils/markdown";
import "./NoteText.css";

const SEGMENT_CLASS: Record<NoteSegmentType, string | undefined> = {
  [NoteSegmentType.TEXT]: undefined,
  [NoteSegmentType.BOLD]: "note-bold",
  [NoteSegmentType.ITALIC]: "note-italic",
  [NoteSegmentType.CODE]: "note-code",
  [NoteSegmentType.LINK]: CssClass.NOTE_LINK,
};

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
        const offset = { [DataAttr.NOTE_OFFSET]: segment.start };

        if (segment.type === NoteSegmentType.LINK) {
          return (
            <a
              key={i}
              href={segment.href ?? segment.text}
              className={CssClass.NOTE_LINK}
              target={Anchor.TARGET_BLANK}
              rel={Anchor.REL}
              title={followLinkTooltip}
              {...offset}
            >
              {segment.text}
            </a>
          );
        }

        return (
          <span key={i} className={SEGMENT_CLASS[segment.type]} {...offset}>
            {segment.text}
          </span>
        );
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
