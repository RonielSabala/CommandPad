import { CssClass } from "@/common/constants/css";
import { Anchor, DataAttr, HtmlTag } from "@/common/constants/dom";
import { AppMode, NoteNodeType, NoteSegmentType } from "@/common/enums";
import {
  formatBinding,
  KeyBinding,
  KEYBINDINGS,
  SPACED_BINDING_SEPARATOR,
} from "@/common/keybindings";
import type {
  NoteList,
  NoteNode,
  NoteSegment,
  NoteTable,
  NoteTableCell,
} from "@/common/types";
import { useRichTooltip } from "@/components/common/tooltip/richTooltip";
import { useTranslation } from "@/i18n";
import { useStore } from "@/store/store";
import { parseNoteNodes } from "@/utils/markdown";
import { classNames } from "@/utils/string";

import "./NoteText.css";

const SEGMENT_CLASS: Record<NoteSegmentType, string | undefined> = {
  [NoteSegmentType.TEXT]: undefined,
  [NoteSegmentType.BOLD]: "note-bold",
  [NoteSegmentType.ITALIC]: "note-italic",
  [NoteSegmentType.CODE]: "note-code",
  [NoteSegmentType.LINK]: CssClass.NOTE_LINK,
};

interface LinkProps {
  segment: NoteSegment;
  binding?: string;
}

function NoteLink({ segment, binding }: LinkProps) {
  const t = useTranslation();
  const tip = useRichTooltip();
  const href = segment.href ?? segment.text;

  return (
    <>
      <a
        href={href}
        className={`${CssClass.NOTE_LINK} ${CssClass.SELECT_KEY_INERT}`}
        target={Anchor.TARGET_BLANK}
        rel={Anchor.REL}
        {...tip.props}
        {...{ [DataAttr.NOTE_OFFSET]: segment.start }}
      >
        {segment.text}
      </a>
      {tip.render((hide) => (
        <>
          <a
            href={href}
            className={classNames(CssClass.TOOLTIP_LINK, "note-follow-link")}
            target={Anchor.TARGET_BLANK}
            rel={Anchor.REL}
            title={href}
            onClick={hide}
          >
            {t.note.followLink}
          </a>
          {binding && <> {t.note.followLinkBinding(binding)}</>}
        </>
      ))}
    </>
  );
}

interface SegmentsProps {
  segments: NoteSegment[];
  requiresLinkModifier?: boolean;
}

function NoteSegments({ segments, requiresLinkModifier }: SegmentsProps) {
  const readMode = useStore((state) => state.mode === AppMode.READ);
  const binding =
    requiresLinkModifier && !readMode
      ? formatBinding(
          KEYBINDINGS[KeyBinding.OPEN_LINK].binding,
          SPACED_BINDING_SEPARATOR,
        )
      : undefined;

  return (
    <>
      {segments.map((segment, i) => {
        if (segment.type === NoteSegmentType.LINK) {
          return <NoteLink key={i} segment={segment} binding={binding} />;
        }

        return (
          <span
            key={i}
            className={SEGMENT_CLASS[segment.type]}
            {...{ [DataAttr.NOTE_OFFSET]: segment.start }}
          >
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

function NoteListView({
  list,
  requiresLinkModifier,
}: {
  list: NoteList;
  requiresLinkModifier?: boolean;
}) {
  const items = list.items.map((item, i) => (
    <li key={i}>
      <NoteSegments
        segments={item.segments}
        requiresLinkModifier={requiresLinkModifier}
      />
      {item.lists.map((nested, j) => (
        <NoteListView
          key={j}
          list={nested}
          requiresLinkModifier={requiresLinkModifier}
        />
      ))}
    </li>
  ));

  return list.ordered ? (
    <ol className="note-list" start={list.start}>
      {items}
    </ol>
  ) : (
    <ul className="note-list">{items}</ul>
  );
}

interface NoteNodesProps {
  nodes: NoteNode[];
  requiresLinkModifier?: boolean;
}

export function NoteNodes({ nodes, requiresLinkModifier }: NoteNodesProps) {
  return (
    <>
      {nodes.map((node, i) => {
        if (node.type === NoteNodeType.TABLE) {
          return (
            <NoteTableView
              key={i}
              table={node.table}
              requiresLinkModifier={requiresLinkModifier}
            />
          );
        }

        if (node.type === NoteNodeType.LIST) {
          return (
            <NoteListView
              key={i}
              list={node.list}
              requiresLinkModifier={requiresLinkModifier}
            />
          );
        }

        return (
          <NoteSegments
            key={i}
            segments={node.segments}
            requiresLinkModifier={requiresLinkModifier}
          />
        );
      })}
    </>
  );
}

interface NoteTextProps {
  text: string;
  requiresLinkModifier?: boolean;
}

export function NoteText({ text, requiresLinkModifier }: NoteTextProps) {
  return (
    <NoteNodes
      nodes={parseNoteNodes(text)}
      requiresLinkModifier={requiresLinkModifier}
    />
  );
}
