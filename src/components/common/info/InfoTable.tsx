import { InfoConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import { FramedSection } from "@/components/common/FramedSection";
import { classNames } from "@/utils/string";
import type { ReactNode } from "react";

import "@/components/blocks/note/NoteText.css";
import "./InfoTable.css";

export type InfoValue = ReactNode | null;

export interface InfoRow {
  label: string;
  value: InfoValue | { columns: readonly InfoValue[] };
  alert?: boolean;
}

export interface InfoSection {
  title?: string;
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
      >
        {sections.map((section, index) => (
          <InfoTableSection key={section.title ?? index} {...section} />
        ))}
      </div>
    </div>
  );
}

function InfoTableSection({ title, columns, rows }: InfoSection) {
  const valueColumns =
    columns?.length ??
    Math.max(
      ...rows.map(({ value }) => (isColumns(value) ? value.columns.length : 1)),
    );

  return (
    <FramedSection title={title}>
      <table>
        {columns && (
          <thead>
            <tr className={CssClass.FRAMED_ROW}>
              <td />
              {columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {rows.map(({ label, value, alert }) => {
            const values = isColumns(value) ? value.columns : [value];

            return (
              <tr
                key={label}
                className={classNames(
                  CssClass.FRAMED_ROW,
                  alert && "info-table-alert",
                )}
              >
                <th scope="row">{label}</th>
                {values.map((cell, at) => (
                  <td
                    key={at}
                    colSpan={
                      at === values.length - 1
                        ? valueColumns - values.length + 1
                        : 1
                    }
                  >
                    {cell ?? <InfoEmpty />}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
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
