import { Key } from "@/common/constants/events";
import { classNames } from "@/utils/string";
import "./FilenameInput.css";

export const FilenameInputSize = {
  DEFAULT: "default",
  COMPACT: "compact",
} as const;
export type FilenameInputSize =
  (typeof FilenameInputSize)[keyof typeof FilenameInputSize];

interface FilenameInputProps {
  value: string;
  extension?: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  size?: FilenameInputSize;
  id?: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export function FilenameInput({
  value,
  extension,
  onChange,
  onSubmit,
  onCancel,
  size = FilenameInputSize.DEFAULT,
  id,
  placeholder,
  autoFocus,
}: FilenameInputProps) {
  return (
    <div className={classNames("filename-input", `is-${size}`)}>
      <input
        id={id}
        className="filename-input-field"
        value={value}
        spellCheck={false}
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === Key.ENTER && onSubmit) {
            event.preventDefault();
            onSubmit();
          } else if (event.key === Key.ESCAPE && onCancel) {
            event.preventDefault();
            onCancel();
          }
        }}
      />

      {extension !== undefined && (
        <span className="filename-input-extension">.{extension}</span>
      )}
    </div>
  );
}
