import { CssClass } from "@/common/constants/css";
import { RenameInput } from "@/components/common/RenameInput";
import { classNames } from "@/utils/string";
import type { ComponentProps, ReactNode } from "react";

interface Props extends ComponentProps<"button"> {
  /** What sits before the name, kept while renaming. */
  leading: ReactNode;
  name: string;
  renaming: boolean;
  maxLength: number;
  onRename: (name: string) => void;
  onRenameEnd: () => void;
}

/** A library row's name button. */
export function LibraryRowLabel({
  className,
  leading,
  name,
  renaming,
  maxLength,
  onRename,
  onRenameEnd,
  ...buttonProps
}: Props) {
  const labelClassName = classNames(
    className,
    CssClass.LIBRARY_ROW_BTN,
    CssClass.LIBRARY_ROW_LABEL,
  );

  if (renaming) {
    return (
      <div
        className={classNames(labelClassName, CssClass.LIBRARY_ROW_RENAMING)}
      >
        {leading}

        <RenameInput
          className={CssClass.LIBRARY_ROW_RENAME_INPUT}
          value={name}
          maxLength={maxLength}
          onCommit={(value) => {
            onRename(value);
            onRenameEnd();
          }}
          onCancel={onRenameEnd}
        />
      </div>
    );
  }

  return (
    <button
      className={classNames(labelClassName, CssClass.NO_USER_SELECT)}
      {...buttonProps}
    >
      {leading}

      <span className={CssClass.LIBRARY_ROW_NAME}>{name}</span>
    </button>
  );
}
