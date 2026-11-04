import { InfoConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { FramedSection } from "@/components/common/FramedSection";
import { classNames } from "@/utils/string";
import type { CSSProperties, ReactNode } from "react";

import "@/components/blocks/note/NoteText.css";
import "./InfoTable.css";

export type InfoValue = ReactNode | null;

export interface InfoRow {
  label: string;
  value: InfoValue | { columns: readonly InfoValue[] };
  alert?: boolean;
}

export interface InfoSection {
  title: string;
  columns?: readonly string[];
  rows: InfoRow[];
}

interface Props {
  title: string;
  /** Shown beside the title. */
  meta?: ReactNode;
  sections: InfoSection[];
}

function isColumns(
  value: InfoRow["value"],
): value is { columns: readonly InfoValue[] } {
  return typeof value === "object" && value !== null && "columns" in value;
}

export function InfoEmpty() {
  return <span className="info-table-empty">{InfoConfig.EMPTY}</span>;
}

export function InfoTable({ title, meta, sections }: Props) {
  return (
    <div className={classNames(CssClass.TOOLTIP_PANEL, "info-table")}>
      <div className="info-table-header">
        <span className={CssClass.TOOLTIP_TITLE}>{title}</span>
        {meta && <span className="info-table-meta">{meta}</span>}
      </div>

      <div
        className={classNames(
          "info-table-sections",
          CssClass.FRAMED_SECTIONS,
          CssClass.TOOLTIP_SCROLL,
        )}
        style={
          {
            "--info-value-columns": Math.max(...sections.map(valueColumnCount)),
          } as CSSProperties
        }
      >
        {sections.map((section) => (
          <InfoTableSection key={section.title} {...section} />
        ))}
      </div>
    </div>
  );
}

function valueColumnCount({ columns, rows }: InfoSection) {
  return (
    columns?.length ??
    Math.max(
      ...rows.map(({ value }) => (isColumns(value) ? value.columns.length : 1)),
    )
  );
}

const CELL_ROW = classNames(CssClass.FRAMED_ROW, CssClass.FRAMED_CELLS);

function InfoTableSection({ title, columns, rows }: InfoSection) {
  return (
    <FramedSection title={title}>
      <div className="info-table-grid" role="table" aria-label={title}>
        {columns && (
          <div className={classNames(CELL_ROW, "info-table-row")} role="row">
            <span />
            {columns.map((column) => (
              <span
                key={column}
                className="info-table-column"
                role="columnheader"
              >
                {column}
              </span>
            ))}
          </div>
        )}

        {rows.map(({ label, value, alert }) => (
          <div
            key={label}
            className={classNames(
              CELL_ROW,
              "info-table-row",
              alert && "info-table-alert",
            )}
            role="row"
          >
            <span className="info-table-label" role="rowheader">
              {label}
            </span>

            {(isColumns(value) ? value.columns : [value]).map((cell, at) => (
              <span key={at} className="info-table-value" role="cell">
                {cell ?? <InfoEmpty />}
              </span>
            ))}
          </div>
        ))}
      </div>
    </FramedSection>
  );
}

export function InfoCodeList({ items }: { items: readonly string[] }) {
  if (items.length === 0) {
    return <InfoEmpty />;
  }

  return items.map((item, index) => (
    <span key={item}>
      {index > 0 && InfoConfig.LIST_SEPARATOR}

      <code className={CssClass.NOTE_CODE}>{item}</code>
    </span>
  ));
}
