import { CssClass } from "@/common/constants/css";
import { Cursor } from "@/common/constants/dom";
import { AppMode, Theme } from "@/common/enums";
import { useStore } from "@/store/store";
import { useEffect } from "react";

export function useThemeClass(): void {
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "theme-light",
      theme === Theme.LIGHT,
    );
  }, [theme]);
}

export function useDocumentLanguage(): void {
  const language = useStore((state) => state.language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
}

export function useSelectModeBodyClass(): void {
  const selectKeyHeld = useStore((state) => state.selectKeyHeld);

  useEffect(() => {
    document.body.classList.toggle(CssClass.SELECT_KEY_HELD, selectKeyHeld);
    return () => document.body.classList.remove(CssClass.SELECT_KEY_HELD);
  }, [selectKeyHeld]);
}

export function useLinkModeBodyClass(): void {
  const linkKeyHeld = useStore((state) => state.linkKeyHeld);

  useEffect(() => {
    document.body.classList.toggle(CssClass.LINK_KEY_HELD, linkKeyHeld);
    if (!linkKeyHeld) {
      document.body.style.cursor = Cursor.DEFAULT;
    }

    return () => {
      document.body.classList.remove(CssClass.LINK_KEY_HELD);
      document.body.style.cursor = Cursor.DEFAULT;
    };
  }, [linkKeyHeld]);
}

export function useWorkspaceBodyClasses(): void {
  const mode = useStore((state) => state.mode);

  useSelectModeBodyClass();
  useLinkModeBodyClass();

  useEffect(() => {
    document.body.classList.toggle("read-mode", mode === AppMode.READ);
    return () => document.body.classList.remove("read-mode");
  }, [mode]);
}
