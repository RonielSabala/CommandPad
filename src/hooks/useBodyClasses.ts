import { CssClass } from "@/common/constants/css";
import { Cursor } from "@/common/constants/dom";
import { AppMode, Theme } from "@/common/enums";
import { useStore } from "@/store/store";
import { useEffect } from "react";

export function useBodyClasses(): void {
  const mode = useStore((state) => state.mode);
  const theme = useStore((state) => state.theme);
  const selectKeyHeld = useStore((state) => state.selectKeyHeld);
  const linkKeyHeld = useStore((state) => state.linkKeyHeld);

  useEffect(() => {
    document.body.classList.toggle("read-mode", mode === AppMode.READ);
  }, [mode]);

  useEffect(() => {
    document.body.classList.toggle(CssClass.SELECT_KEY_HELD, selectKeyHeld);
  }, [selectKeyHeld]);

  useEffect(() => {
    document.body.classList.toggle(CssClass.LINK_KEY_HELD, linkKeyHeld);
    if (!linkKeyHeld) {
      document.body.style.cursor = Cursor.DEFAULT;
    }
  }, [linkKeyHeld]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "theme-light",
      theme === Theme.LIGHT,
    );
  }, [theme]);
}
