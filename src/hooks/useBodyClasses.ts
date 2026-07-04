import { CssClass } from "@/common/constants/css";
import { AppMode, Theme } from "@/common/enums";
import { useStore } from "@/store/store";
import { useEffect } from "react";

// Reflect cross-cutting store flags onto <body>/<html> classes

export function useBodyClasses(): void {
  const mode = useStore((s) => s.mode);
  const theme = useStore((s) => s.theme);
  const ctrlHeld = useStore((s) => s.ctrlHeld);
  const altHeld = useStore((s) => s.altHeld);
  const selecting = useStore((s) => s.selectedBlockIds.size > 0);

  useEffect(() => {
    document.body.classList.toggle(CssClass.READ_MODE, mode === AppMode.READ);
  }, [mode]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      CssClass.THEME_LIGHT,
      theme === Theme.LIGHT,
    );
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle(CssClass.CTRL_HELD, ctrlHeld);
  }, [ctrlHeld]);

  useEffect(() => {
    document.body.classList.toggle(CssClass.ALT_HELD, altHeld);
    if (!altHeld) {
      document.body.style.cursor = "";
    }
  }, [altHeld]);

  useEffect(() => {
    document.body.classList.toggle(CssClass.SELECTING, selecting);
  }, [selecting]);
}
