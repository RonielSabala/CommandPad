import { InfoConfig } from "@/common/config";
import { CssClass } from "@/common/constants/css";
import type { ReactNode } from "react";

import "@/components/blocks/note/NoteText.css";
import "./InfoTable.css";

export interface InfoRow {
  label: string;
  value: ReactNode | null;
}

interface Props {
  title: string;
  rows: InfoRow[];
}

export function InfoTable({ title, rows }: Props) {
  return (
    <div className="info-table">
      <div className="info-table-title">{title}</div>

      <div className="info-table-rows">
        <table className={CssClass.NOTE_TABLE}>
          <tbody>
            {rows.map(({ label, value }) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{value ?? InfoConfig.EMPTY}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InfoCodeList({ items }: { items: readonly string[] }) {
  if (items.length === 0) {
    return InfoConfig.EMPTY;
  }

  return items.map((item, index) => (
    <span key={item}>
      {index > 0 && InfoConfig.LIST_SEPARATOR}
      <code className={CssClass.NOTE_CODE}>{item}</code>
    </span>
  ));
}
