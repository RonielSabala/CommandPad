import type { NoteSegment } from "@/common/types";

import { nodeRuns, parseNoteNodes } from "./nodes";

const segmentsText = (segments: NoteSegment[]) =>
  segments.map((segment) => segment.text).join("");

export function noteToPlainText(text: string): string {
  const runs: string[] = [];

  for (const node of parseNoteNodes(text)) {
    for (const segments of nodeRuns(node)) {
      const run = segmentsText(segments);
      if (run) {
        runs.push(run);
      }
    }
  }

  return runs.join(" ");
}
