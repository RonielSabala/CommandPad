import { InfoConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
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
  const valueColumns = Math.max(
    ...sections.map(({ columns }) => columns?.length ?? 1),
  );

  return (
    <div className="info-table">
      <div className="info-table-header">
        <span className="info-table-title">{title}</span>
        {meta && <span className="info-table-meta">{meta}</span>}
      </div>

      <div className={classNames("info-table-rows", CssClass.TOOLTIP_SCROLL)}>
        <table>
          {sections.map(({ title: heading, columns, rows }, index) => (
            <tbody key={heading ?? index}>
              {(heading || columns) && (
                <tr className="info-table-heading">
                  <th
                    scope={columns ? undefined : "colgroup"}
                    colSpan={columns ? 1 : valueColumns + 1}
                  >
                    {heading}
                  </th>

                  {columns?.map((column, at) => (
                    <th
                      key={column}
                      scope="col"
                      colSpan={
                        at === columns.length - 1
                          ? valueColumns - columns.length + 1
                          : 1
                      }
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              )}

              {rows.map(({ label, value, alert }) => {
                const values = isColumns(value) ? value.columns : [value];

                return (
                  <tr
                    key={label}
                    className={classNames(alert && "info-table-alert")}
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
          ))}
        </table>
      </div>
    </div>
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
