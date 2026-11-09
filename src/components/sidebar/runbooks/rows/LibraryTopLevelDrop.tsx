import { LibraryDropZone } from "@/common/enums";
import { classNames } from "@/utils/string";

import "./LibraryRow.css";
import { useLibraryRowDrag } from "./useLibraryRowDrag";

const intoTopLevel = () => LibraryDropZone.INTO;

/** An area where a drop goes to the top level of the library. */
export function LibraryTopLevelDrop() {
  const { dropClassName, rowProps } = useLibraryRowDrag(null, intoTopLevel);

  return (
    <div
      className={classNames("library-top-level-drop", dropClassName)}
      {...rowProps}
    />
  );
}
