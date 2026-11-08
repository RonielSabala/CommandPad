import { LibraryFolderConfig } from "@/common/config";
import { LibraryItemKind } from "@/common/enums";
import type { LibraryRow } from "@/utils/libraryTree";

import { LibraryFolderRow } from "./LibraryFolderRow";
import { LibraryRunbookRow } from "./LibraryRunbookRow";

interface Props {
  row: LibraryRow;
  marksOpenTabs?: boolean;
}

/** One row of the library's folder tree. */
export function LibraryTreeRow({ row, marksOpenTabs }: Props) {
  return row.kind === LibraryItemKind.FOLDER ? (
    <LibraryFolderRow folder={row.folder} depth={row.depth} empty={row.empty} />
  ) : (
    <LibraryRunbookRow
      runbook={row.runbook}
      marksOpenTabs={marksOpenTabs}
      depth={row.depth}
      path={
        row.path &&
        LibraryFolderConfig.ROOT_PATH +
          row.path.join(LibraryFolderConfig.PATH_SEPARATOR)
      }
    />
  );
}
