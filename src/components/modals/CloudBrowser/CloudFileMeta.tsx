import type { CloudEntry } from "@/services/cloud";
import { useStore } from "@/store/store";
import { formatFileSize, formatTimestamp } from "@/utils/format";
import "./CloudFileMeta.css";

export function CloudFileMeta({ file }: { file: CloudEntry }) {
  const language = useStore((state) => state.language);
  const modifiedAt =
    file.modifiedAt === null
      ? null
      : formatTimestamp(file.modifiedAt, language);

  const size = file.size === null ? null : formatFileSize(file.size, language);

  if (modifiedAt === null && size === null) {
    return null;
  }

  return (
    <span className="cloud-browser-file-meta">
      {modifiedAt !== null && (
        <span className="cloud-browser-file-date">{modifiedAt}</span>
      )}

      {size !== null && <span className="cloud-browser-file-size">{size}</span>}
    </span>
  );
}
