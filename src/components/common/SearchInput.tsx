import { CssClass } from "@/common/constants/css";
import { tooltip } from "@/components/common/tooltip/tooltip";
import { SearchIcon, XIcon } from "@/components/icons";
import { useTranslation } from "@/i18n";
import { classNames } from "@/utils/string";

import "./SearchInput.css";

interface Props {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchInput({
  value,
  placeholder,
  onChange,
  className,
}: Props) {
  const t = useTranslation();
  return (
    <div className={classNames("search-input-wrapper", className)}>
      <input
        className={classNames("search-input", CssClass.NO_LIGATURES)}
        type="text"
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <SearchIcon
        className={classNames(
          "search-input-icon",
          CssClass.ICON_MD,
          CssClass.ICON_BOLD,
        )}
      />
      {value && (
        <button
          className="search-input-clear-btn"
          aria-label={t.common.clearSearch}
          {...tooltip(t.common.clearSearch)}
          onClick={() => onChange("")}
        >
          <XIcon className={classNames(CssClass.ICON_SM, CssClass.ICON_BOLD)} />
        </button>
      )}
    </div>
  );
}
