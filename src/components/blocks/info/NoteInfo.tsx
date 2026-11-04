import { NoteStyle } from "@/common/enums";
import type { NoteBlock } from "@/common/types";
import { useInfoFormat } from "@/components/common/info/useInfoFormat";
import { useLanguage, useTranslation } from "@/i18n";
import { noteStats } from "@/utils/markdown";
import { useMemo } from "react";

import type { BlockViewProps } from "../blockViews";
import { BlockInfoTable } from "./BlockInfoTable";

export function NoteInfo({ block }: BlockViewProps<NoteBlock>) {
  const t = useTranslation();
  const format = useInfoFormat();
  const language = useLanguage();
  const stats = useMemo(
    () => noteStats(block.text, language),
    [block.text, language],
  );

  const { rows, sections } = t.info;

  return (
    <BlockInfoTable
      block={block}
      sections={[
        {
          title: sections.text,
          rows: [
            { label: rows.characters, value: format.count(stats.characters) },
            {
              label: rows.nonSpaceCharacters,
              value: format.count(stats.nonSpaceCharacters),
            },
            { label: rows.lines, value: format.count(stats.lines) },
            { label: rows.paragraphs, value: format.count(stats.paragraphs) },
          ],
        },
        {
          title: sections.reading,
          rows: [
            {
              label: rows.style,
              value: t.note.styleLabel[block.style ?? NoteStyle.BODY],
            },
            {
              label: rows.readingTime,
              value:
                stats.readingMinutes > 0
                  ? t.info.readingTime(format.minutes(stats.readingMinutes))
                  : null,
            },
            { label: rows.words, value: format.count(stats.words) },
          ],
        },
        {
          title: sections.content,
          rows: [
            { label: rows.links, value: format.count(stats.links) },
            { label: rows.tables, value: format.count(stats.tables) },
            { label: rows.listItems, value: format.count(stats.listItems) },
          ],
        },
      ]}
    />
  );
}
