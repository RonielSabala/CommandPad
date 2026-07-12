import { EventType, Key } from "@/common/constants/events";
import { SidebarSectionChevronIcon } from "@/components/icons";
import { LanguageFlag } from "@/components/icons/flags";
import {
  LANGUAGE_LABELS,
  LANGUAGE_NAMES,
  LANGUAGE_ORDER,
  useTranslation,
  type Language,
} from "@/i18n";
import { useStore } from "@/store/store";
import { classNames } from "@/utils/string";
import { useEffect, useRef, useState } from "react";
import { Translate } from "react-bootstrap-icons";
import "./LanguageSelect.css";

interface FlagCircleProps {
  language: Language;
}

function FlagCircle({ language }: FlagCircleProps) {
  return (
    <span className="language-flag" aria-hidden="true">
      <LanguageFlag language={language} />
    </span>
  );
}

export function LanguageSelect() {
  const t = useTranslation();
  const language = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === Key.ESCAPE) {
        setOpen(false);
      }
    };

    document.addEventListener(EventType.MOUSE_DOWN, onMouseDown);
    document.addEventListener(EventType.KEY_DOWN, onKeyDown);
    return () => {
      document.removeEventListener(EventType.MOUSE_DOWN, onMouseDown);
      document.removeEventListener(EventType.KEY_DOWN, onKeyDown);
    };
  }, [open]);

  const selectLanguage = (next: Language) => {
    setLanguage(next);
    setOpen(false);
  };

  return (
    <div className="language-select" ref={rootRef}>
      <button
        className="btn btn-lg btn-flat-icon"
        title={t.header.changeLanguage}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <FlagCircle language={language} />
        <span className="language-code">{LANGUAGE_LABELS[language]}</span>
        <Translate className="icon" />
        <SidebarSectionChevronIcon
          className={classNames(
            "language-select-chevron icon-md icon-bold",
            open && "is-open",
          )}
        />
      </button>

      {open && (
        <ul className="language-select-menu" role="listbox">
          {LANGUAGE_ORDER.map((option) => (
            <li key={option} role="option" aria-selected={option === language}>
              <button
                className={classNames(
                  "language-select-option",
                  option === language && "is-selected",
                )}
                onClick={() => selectLanguage(option)}
              >
                <FlagCircle language={option} />
                {LANGUAGE_NAMES[option]}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
