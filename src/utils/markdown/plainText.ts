import { NoteNodeType } from "@/common/enums";
import type { NoteList, NoteSegment, NoteTableCell } from "@/common/types";

import { parseNoteNodes } from "./nodes";

export function noteToPlainText(text: string): string {
  const segmentsText = (segments: NoteSegment[]) =>
    segments.map((segment) => segment.text).join("");

  const cellText = (cell: NoteTableCell) => segmentsText(cell.segments);

  const listText = (list: NoteList): string =>
    list.items
      .map((item) =>
        [segmentsText(item.segments), ...item.lists.map(listText)]
          .filter(Boolean)
          .join(" "),
      )
      .join(" ");

  return parseNoteNodes(text)
    .map((node) => {
      if (node.type === NoteNodeType.TABLE) {
        return [node.table.head, ...node.table.rows]
          .flatMap((row) => row.map(cellText))
          .join(" ");
      }

      return node.type === NoteNodeType.LIST
        ? listText(node.list)
        : segmentsText(node.segments);
    })
    .join(" ");
}
